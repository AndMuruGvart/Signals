import { Injectable } from '@nestjs/common';
import { ScenarioStatus } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma.service';
import { MetricsService } from '../infrastructure/metrics.service';
import { LokiService } from '../infrastructure/loki.service';
import { SentryService } from '../infrastructure/sentry.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';

@Injectable()
export class ScenarioService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly metricsService: MetricsService,
    private readonly lokiService: LokiService,
    private readonly sentryService: SentryService,
  ) {}

  async getHistory(limit = 10) {
    return this.prismaService.scenarioRun.findMany({
      take: Math.min(Math.max(limit, 1), 25),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async runScenario(payload: CreateScenarioDto) {
    const startedAt = Date.now();

    this.metricsService.recordRequested(payload.scenario, payload.intensity);

    const run = await this.prismaService.scenarioRun.create({
      data: {
        scenario: payload.scenario,
        intensity: payload.intensity,
        note: payload.note,
        status: ScenarioStatus.running,
      },
    });

    await this.lokiService.log('info', 'Scenario started', {
      scenario: payload.scenario,
      intensity: payload.intensity,
      runId: run.id,
      status: 'running',
    });

    try {
      const summary = await this.executeScenario(payload.scenario, payload.intensity);
      const durationMs = Date.now() - startedAt;

      this.metricsService.recordCompleted(
        payload.scenario,
        payload.intensity,
        'succeeded',
        durationMs,
      );

      await this.lokiService.log('info', 'Scenario succeeded', {
        scenario: payload.scenario,
        intensity: payload.intensity,
        runId: run.id,
        status: 'succeeded',
        durationMs,
      });

      return this.prismaService.scenarioRun.update({
        where: { id: run.id },
        data: {
          summary,
          durationMs,
          status: ScenarioStatus.succeeded,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const exception =
        error instanceof Error ? error : new Error('Unknown scenario failure');
      const sentryEventId = await this.sentryService.captureScenarioError(exception, {
        scenario: payload.scenario,
        intensity: payload.intensity,
        runId: run.id,
      });

      this.metricsService.recordCompleted(
        payload.scenario,
        payload.intensity,
        'failed',
        durationMs,
      );

      await this.lokiService.log('error', 'Scenario failed', {
        scenario: payload.scenario,
        intensity: payload.intensity,
        runId: run.id,
        status: 'failed',
        durationMs,
        sentryEventId,
      });

      return this.prismaService.scenarioRun.update({
        where: { id: run.id },
        data: {
          durationMs,
          errorMessage: exception.message,
          sentryEventId,
          status: ScenarioStatus.failed,
          completedAt: new Date(),
        },
      });
    }
  }

  private async executeScenario(scenario: string, intensity: string) {
    if (scenario === 'traffic_burst') {
      await this.sleep(intensity === 'high' ? 420 : intensity === 'medium' ? 280 : 140);
      return `Processed a synthetic traffic burst at ${intensity} intensity.`;
    }

    if (scenario === 'latency_spike') {
      await this.sleep(intensity === 'high' ? 1900 : intensity === 'medium' ? 1250 : 800);
      return `Observed a controlled latency spike at ${intensity} intensity.`;
    }

    await this.sleep(intensity === 'high' ? 350 : intensity === 'medium' ? 250 : 180);
    throw new Error(`Synthetic system error triggered at ${intensity} intensity.`);
  }

  private sleep(durationMs: number) {
    return new Promise((resolve) => setTimeout(resolve, durationMs));
  }
}