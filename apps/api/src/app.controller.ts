import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';
import { MetricsService } from './infrastructure/metrics.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  getRoot() {
    return this.appService.getStatus();
  }

  @Get('health')
  getHealth() {
    return this.appService.getStatus();
  }

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    return this.metricsService.render();
  }
}
