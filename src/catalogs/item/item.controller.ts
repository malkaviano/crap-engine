import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { ItemService } from '@catalogs/item/item.service';
import { CreateItemDto } from '@dtos/create-item.dto';
import { ItemDefinition } from '@definitions/item.definition';

@ApiBearerAuth()
@Controller('catalogs/item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto): Observable<string> {
    return this.itemService.create(createItemDto);
  }

  @Get(':category/:name')
  findOne(
    @Param('category') category: string,
    @Param('name') name: string,
  ): Observable<ItemDefinition> {
    return this.itemService.findOne(category, name);
  }

  @Delete(':category/:name')
  remove(
    @Param('category') category: string,
    @Param('name') name: string,
  ): Observable<string> {
    return this.itemService.remove(category, name);
  }
}
