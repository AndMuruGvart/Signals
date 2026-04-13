import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { SCENARIO_NAMES, SCENARIO_INTENSITIES } from '../scenario.types';

export class CreateScenarioDto {
  @IsIn(SCENARIO_NAMES)
  scenario!: (typeof SCENARIO_NAMES)[number];

  @IsIn(SCENARIO_INTENSITIES)
  intensity!: (typeof SCENARIO_INTENSITIES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(180)
  note?: string;
}