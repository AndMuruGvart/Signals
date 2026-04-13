import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './infrastructure/prisma.service';
import { MetricsService } from './infrastructure/metrics.service';
import { LokiService } from './infrastructure/loki.service';
import { SentryService } from './infrastructure/sentry.service';
import { ScenarioController } from './scenario/scenario.controller';
import { ScenarioService } from './scenario/scenario.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, ScenarioController],
  providers: [
    AppService,
    PrismaService,
    MetricsService,
    LokiService,
    SentryService,
    ScenarioService,
  ],
})
export class AppModule {}
