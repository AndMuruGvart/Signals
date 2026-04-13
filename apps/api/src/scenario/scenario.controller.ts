import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ScenarioService } from './scenario.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';

@Controller('api/scenarios')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @Get('history')
  async getHistory(@Query('limit') rawLimit?: string) {
    const limit = Number(rawLimit ?? 10);
    return this.scenarioService.getHistory(Number.isNaN(limit) ? 10 : limit);
  }

  @Post()
  async runScenario(@Body() payload: CreateScenarioDto) {
    return this.scenarioService.runScenario(payload);
  }
}