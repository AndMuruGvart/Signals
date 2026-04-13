import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type LogLevel = 'info' | 'error';

@Injectable()
export class LokiService {
  private readonly logger = new Logger(LokiService.name);
  private readonly pushUrl: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.pushUrl = this.configService.get<string>('LOKI_PUSH_URL');
  }

  async log(
    level: LogLevel,
    message: string,
    context: Record<string, string | number | null | undefined>,
  ) {
    const entry = {
      app: 'signal-lab-api',
      level,
      message,
      time: new Date().toISOString(),
      ...context,
    };

    if (level === 'error') {
      this.logger.error(JSON.stringify(entry));
    } else {
      this.logger.log(JSON.stringify(entry));
    }

    if (!this.pushUrl) {
      return;
    }

    try {
      await fetch(this.pushUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streams: [
            {
              stream: {
                app: 'signal-lab-api',
                level,
                scenario: String(context.scenario ?? 'unknown'),
                status: String(context.status ?? 'unknown'),
              },
              values: [[`${Date.now() * 1_000_000}`, JSON.stringify(entry)]],
            },
          ],
        }),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to push log line to Loki: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
}
