import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      service: 'signal-lab-api',
      status: 'ok',
      time: new Date().toISOString(),
    };
  }
}
