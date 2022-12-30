import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ItemService } from '@resources/item/item.service';
import { CreateItemDto } from '@dtos/create-item.dto';
import { ItemDefinition } from '@definitions/item.definition';
import { ApplicationError } from '@errors/application.error';

@ApiBearerAuth()
@Controller('resources/item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  async create(@Body() createItemDto: CreateItemDto) {
    try {
      return await this.itemService.save(createItemDto);
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Get(':name')
  async findOne(@Param('name') name: string): Promise<ItemDefinition | null> {
    try {
      return await this.itemService.findOne(name);
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Delete(':name')
  async remove(@Param('name') name: string) {
    try {
      return await this.itemService.remove(name);
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
