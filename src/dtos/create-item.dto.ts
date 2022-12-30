import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { ConsumableDto } from '@dtos/consumable.dto';
import { WeaponDto } from '@dtos/weapon.dto';

export class CreateItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  public category: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  public name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  public label: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  public description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  public usability: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  public skillName: string | null;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => WeaponDto)
  public weapon?: WeaponDto;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => ConsumableDto)
  public consumable?: ConsumableDto;

  @ApiProperty()
  @IsOptional()
  public readable?: string;
}
