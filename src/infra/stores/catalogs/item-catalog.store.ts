import { Injectable, OnModuleInit } from '@nestjs/common';

import { AstraClient } from '@root/infra/clients/astra.client';
import { ItemCatalogStoreInterface } from '@interfaces/stores/item-catalog-store.interface';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { ItemDefinition } from '@definitions/item.definition';
import { InfraError } from '@errors/infra.error';
import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';
import { ConverterHelperService } from '@helpers/converter.helper.service';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ReadableDefinition } from '@definitions/readable.definition';

@Injectable()
export class ItemCatalogStore
  implements OnModuleInit, ItemCatalogStoreInterface
{
  private readonly fields: string;

  private readonly insertStmt: string;

  private readonly selectStmt: string;

  private readonly deleteStmt: string;

  constructor(
    private readonly astraClient: AstraClient,
    private readonly configValuesHelper: ConfigValuesHelper,
    private readonly logger: CustomLoggerHelper,
    private readonly converterHelperService: ConverterHelperService,
  ) {
    this.fields = ['category', 'name', 'payload'].join(',');

    this.insertStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items_catalog ` +
      `(${this.fields}) values(?,?,?);`;

    this.selectStmt = `select payload from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items_catalog where category = ? and name = ?;`;

    this.deleteStmt = `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items_catalog where category = ? and name = ?;`;
  }

  public async onModuleInit(): Promise<void> {
    await this.astraClient.executeQuery(
      `CREATE TABLE IF NOT EXISTS ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items_catalog ` +
        '(name text,category text,payload text, PRIMARY KEY (category, name));',
    );
  }

  public async getItem<
    T extends WeaponDefinition | ConsumableDefinition | ReadableDefinition,
  >(category: string, name: string): Promise<T | null> {
    try {
      const categoryValue = this.astraClient.newStringValue(category);

      const nameValue = this.astraClient.newStringValue(name);

      const result = await this.astraClient.executeQuery(
        this.selectStmt,
        this.astraClient.createValues(categoryValue, nameValue),
      );

      const rows = result?.getRowsList();

      if (rows?.length) {
        const items = rows
          .map((r) => {
            const json = JSON.parse(r.getValuesList()[0].getString());

            return this.converterHelperService.inflateItemDefinition<T>(json);
          })
          .filter((element): element is T => {
            return element !== null;
          });

        return items[0];
      }

      return null;
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async upsertItem(item: ItemDefinition): Promise<void> {
    try {
      const nameValue = this.astraClient.newStringValue(item.info.name);

      const categoryValue = this.astraClient.newStringValue(item.category);

      const payload = this.astraClient.newObjectValue(item);

      await this.astraClient.executeQuery(
        this.insertStmt,
        this.astraClient.createValues(categoryValue, nameValue, payload),
      );
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async removeItem(category: string, name: string): Promise<void> {
    try {
      const categoryValue = this.astraClient.newStringValue(category);

      const nameValue = this.astraClient.newStringValue(name);

      await this.astraClient.executeQuery(
        this.deleteStmt,
        this.astraClient.createValues(categoryValue, nameValue),
      );
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }
}
