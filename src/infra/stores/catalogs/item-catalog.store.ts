import { Injectable, OnModuleInit } from '@nestjs/common';

import { AstraClient } from '@root/infra/clients/astra.client';
import { ItemCatalogStoreInterface } from '@interfaces/stores/item-catalog-store.interface';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { ItemDefinition } from '@definitions/item.definition';
import { InfraError } from '@errors/infra.error';
import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';
import { ConverterHelper } from '@helpers/converter.helper.service';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ReadableDefinition } from '@definitions/readable.definition';

@Injectable()
export class ItemCatalogStore
  implements OnModuleInit, ItemCatalogStoreInterface
{
  private readonly insertStmt: string;

  private readonly selectStmt: string;

  private readonly deleteStmt: string;

  constructor(
    private readonly astraClient: AstraClient,
    private readonly configValuesHelper: ConfigValuesHelper,
    private readonly logger: CustomLoggerHelper,
    private readonly converterHelperService: ConverterHelper,
  ) {
    const fields = ['category', 'name', 'payload'].join(',');

    const predicate = 'category = ? and name = ?';

    this.insertStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.item_catalog ` +
      `(${fields}) values(?,?,?);`;

    this.selectStmt =
      'select payload ' +
      `from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.item_catalog ` +
      `where ${predicate};`;

    this.deleteStmt =
      `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.item_catalog ` +
      `where ${predicate};`;
  }

  public async onModuleInit(): Promise<void> {
    await this.astraClient.executeStmt(
      `CREATE TABLE IF NOT EXISTS ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.item_catalog ` +
        '(name text,category text,payload text, PRIMARY KEY (category, name));',
      [],
    );
  }

  public async getItem<
    T extends WeaponDefinition | ConsumableDefinition | ReadableDefinition,
  >(category: string, name: string): Promise<T | null> {
    try {
      const values = await this.astraClient.executeStmt(this.selectStmt, [
        [category, 'string'],
        [name, 'string'],
      ]);

      if (values.length) {
        const items = this.allItems<T>(values);

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
      await this.astraClient.executeStmt(this.insertStmt, [
        [item.category, 'string'],
        [item.info.name, 'string'],
        [JSON.stringify(item), 'string'],
      ]);
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async removeItem(category: string, name: string): Promise<void> {
    try {
      await this.astraClient.executeStmt(this.deleteStmt, [
        [category, 'string'],
        [name, 'string'],
      ]);
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  private allItems<
    T extends WeaponDefinition | ConsumableDefinition | ReadableDefinition,
  >(values: (string | number | boolean | null)[][]) {
    return values
      .map((v) => {
        const json = JSON.parse(v[0] as string);

        return this.converterHelperService.inflateItemDefinition<T>(json);
      })
      .filter((element): element is T => {
        return element !== null;
      });
  }
}
