import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ItemService } from '@catalogs/item/item.service';
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

  @Get(':category/:name')
  async findOne(
    @Param('category') category: string,
    @Param('name') name: string,
  ): Promise<ItemDefinition | null> {
    try {
      const item = await this.itemService.findOne(category, name);

      if (!item) {
        throw new NotFoundException('Item not found');
      }

      return item;
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Delete(':category/:name')
  async remove(
    @Param('category') category: string,
    @Param('name') name: string,
  ) {
    try {
      return await this.itemService.remove(category, name);
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
