import { Injectable, OnModuleInit } from '@nestjs/common';

import { defer, from, map, Observable } from 'rxjs';

import { AstraClient } from '@root/infra/clients/astra.client';
import { ItemCatalogStoreInterface } from '@interfaces/stores/item-catalog-store.interface';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { ItemDefinition } from '@definitions/item.definition';
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
    private readonly converterHelperService: ConverterHelper,
  ) {
    const fields = ['category', 'name', 'payload'].join(',');

    const predicate = 'category = ? and name = ?';

    this.insertStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.item_catalog ` +
      `(${fields}) values(?,?,?) IF NOT EXISTS;`;

    this.selectStmt =
      'select payload ' +
      `from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.item_catalog ` +
      `where ${predicate};`;

    this.deleteStmt =
      `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.item_catalog ` +
      `where ${predicate} IF EXISTS;`;
  }

  public async onModuleInit(): Promise<void> {
    await this.astraClient.executeStmt(
      `CREATE TABLE IF NOT EXISTS ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.item_catalog ` +
        '(name text,category text,payload text, PRIMARY KEY (category, name));',
      [],
    );
  }

  public getItem<
    T extends WeaponDefinition | ConsumableDefinition | ReadableDefinition,
  >(category: string, name: string): Observable<T | null> {
    return defer(() =>
      from(
        this.astraClient.executeStmt(this.selectStmt, [
          [category, 'string'],
          [name, 'string'],
        ]),
      ),
    ).pipe(
      map((values) => {
        if (values.length) {
          const items = this.allItems<T>(values);

          return items[0];
        }

        return null;
      }),
    );
  }

  public save(item: ItemDefinition): Observable<boolean> {
    return defer(() =>
      from(
        this.astraClient.executeStmt(this.insertStmt, [
          [item.category, 'string'],
          [item.info.name, 'string'],
          [JSON.stringify(item), 'string'],
        ]),
      ),
    ).pipe(
      map((result) => {
        return !!result[0][0];
      }),
    );
  }

  public removeItem(category: string, name: string): Observable<boolean> {
    return defer(() =>
      from(
        this.astraClient.executeStmt(this.deleteStmt, [
          [category, 'string'],
          [name, 'string'],
        ]),
      ),
    ).pipe(
      map((result) => {
        return !!result[0][0];
      }),
    );
  }

  private allItems<
    T extends WeaponDefinition | ConsumableDefinition | ReadableDefinition,
  >(values: (string | number | boolean | null)[][]) {
    return values
      .map((v) => {
        return this.converterHelperService.inflateItemDefinition<T>(
          v[0] as string,
        );
      })
      .filter((element): element is T => {
        return element !== null;
      });
  }
}
