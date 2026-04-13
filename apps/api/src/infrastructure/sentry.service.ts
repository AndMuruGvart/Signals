import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    this.enabled = Boolean(dsn);

    if (dsn && !Sentry.getClient()) {
      Sentry.init({
        dsn,
        tracesSampleRate: 0,
        environment:
          this.configService.get<string>('NODE_ENV') ?? 'development',
      });
    }
  }

  async captureScenarioError(
    error: Error,
    context: Record<string, string | number | null | undefined>,
  ) {
    if (!this.enabled) {
      this.logger.warn('Sentry DSN is not configured, skipping error capture.');
      return null;
    }

    const eventId = Sentry.captureException(error, {
      tags: {
        scenario: String(context.scenario ?? 'unknown'),
        intensity: String(context.intensity ?? 'unknown'),
      },
      extra: context,
    });

    await Sentry.flush(2000);

    return eventId;
  }
}
