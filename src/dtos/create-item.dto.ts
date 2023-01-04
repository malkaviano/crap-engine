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
import { ReadableDto } from '@dtos/readable.dto';

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
  @MaxLength(100)
  public description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  public usability: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  public skillName?: string;

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
  @ValidateNested()
  @Type(() => ReadableDto)
  public readable?: ReadableDto;
}
