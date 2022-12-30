import { ApiProperty } from '@nestjs/swagger';

import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ConsumableDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public effectType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  public amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  public energy: number;
}
