import { ApiProperty } from '@nestjs/swagger';

import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ReadableDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  public paragraphs: string[];
}
