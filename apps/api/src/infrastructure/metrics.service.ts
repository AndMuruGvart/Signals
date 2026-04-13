import { Injectable } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';

const registry = new Registry();

let defaultMetricsRegistered = false;

function getOrCreateCounter(name: string, help: string, labelNames: string[]) {
  const existing = registry.getSingleMetric(name);

  if (existing) {
    return existing as Counter<string>;
  }

  return new Counter({
    name,
    help,
    labelNames,
    registers: [registry],
  });
}

function getOrCreateHistogram(
  name: string,
  help: string,
  labelNames: string[],
) {
  const existing = registry.getSingleMetric(name);

  if (existing) {
    return existing as Histogram<string>;
  }

  return new Histogram({
    name,
    help,
    labelNames,
    buckets: [50, 100, 250, 500, 1000, 1500, 2500, 5000],
    registers: [registry],
  });
}

@Injectable()
export class MetricsService {
  private readonly requestedCounter = getOrCreateCounter(
    'signal_lab_scenario_requested_total',
    'Number of requested Signal Lab scenarios.',
    ['scenario', 'intensity'],
  );

  private readonly completedCounter = getOrCreateCounter(
    'signal_lab_scenario_runs_total',
    'Number of completed Signal Lab scenario runs.',
    ['scenario', 'intensity', 'status'],
  );

  private readonly durationHistogram = getOrCreateHistogram(
    'signal_lab_scenario_duration_ms',
    'Duration of completed Signal Lab scenario runs in milliseconds.',
    ['scenario', 'intensity', 'status'],
  );

  constructor() {
    if (!defaultMetricsRegistered) {
      collectDefaultMetrics({
        prefix: 'signal_lab_runtime_',
        register: registry,
      });
      defaultMetricsRegistered = true;
    }
  }

  recordRequested(scenario: string, intensity: string) {
    this.requestedCounter.inc({ scenario, intensity });
  }

  recordCompleted(
    scenario: string,
    intensity: string,
    status: 'succeeded' | 'failed',
    durationMs: number,
  ) {
    this.completedCounter.inc({ scenario, intensity, status });
    this.durationHistogram.observe({ scenario, intensity, status }, durationMs);
  }

  render() {
    return registry.metrics();
  }
}
