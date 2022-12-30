import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsInt, IsNotEmpty, IsObject } from 'class-validator';

export class WeaponDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  public damage: {
    dice: { [key: string]: number };
    fixed: number;
    effectType: string;
  };

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  public dodgeable: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  public energyActivation: number;
}
