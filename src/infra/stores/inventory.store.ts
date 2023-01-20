import { Injectable, OnModuleInit } from '@nestjs/common';

import { defer, from, map, Observable } from 'rxjs';

import { InventoryStoreInterface } from '@interfaces/stores/inventory-store.interface';
import { AstraClient } from '@root/infra/clients/astra.client';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { ItemEntityInterface } from '@interfaces/item-entity.interface';
import { WeaponEntity } from '@entities/weapon.entity';
import { ConverterHelper } from '@helpers/converter.helper.service';
import { ConsumableEntity } from '@entities/consumable.entity';
import { ReadableEntity } from '@entities/readable.entity';

@Injectable()
export class InventoryStore implements OnModuleInit, InventoryStoreInterface {
  private readonly selectStmt: string;

  private readonly insertStmt: string;

  private readonly deleteStmt: string;

  private readonly removeStmt: string;

  constructor(
    private readonly astraClient: AstraClient,
    private readonly configValuesHelper: ConfigValuesHelper,
    private readonly converterHelperService: ConverterHelper,
  ) {
    const fields = ['interactive_id', 'item_id', 'item_payload'].join(',');

    const predicate = 'interactive_id = ? and item_id = ?';

    this.insertStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      `(${fields}) values(?,?,?) IF NOT EXISTS;`;

    this.selectStmt =
      `select ${fields} ` +
      `from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      `where ${predicate};`;

    this.deleteStmt =
      `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      `where ${predicate} IF EXISTS;`;

    this.removeStmt =
      `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      `where interactive_id = ?;`;
  }

  public async onModuleInit(): Promise<void> {
    await this.astraClient.executeStmt(
      'CREATE TABLE IF NOT EXISTS ' +
        ` ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
        '(interactive_id text,' +
        'item_id text,' +
        'item_payload text,' +
        'PRIMARY KEY (interactive_id, item_id));',
      [],
    );
  }

  public store(
    interactiveId: string,
    itemEntity: ItemEntityInterface,
  ): Observable<boolean> {
    return defer(() =>
      from(
        this.astraClient.executeStmt(this.insertStmt, [
          [interactiveId, 'string'],
          [itemEntity.id, 'string'],
          [JSON.stringify(itemEntity), 'string'],
        ]),
      ),
    ).pipe(
      map((result) => {
        return !!result[0][0];
      }),
    );
  }

  public look<T extends WeaponEntity | ConsumableEntity | ReadableEntity>(
    interactiveId: string,
    itemId: string,
  ): Observable<T | null> {
    return defer(() =>
      from(
        this.astraClient.executeStmt(this.selectStmt, [
          [interactiveId, 'string'],
          [itemId, 'string'],
        ]),
      ),
    ).pipe(
      map((values) => {
        if (values.length) {
          return this.converterHelperService.inflateItemEntity<T>(
            values[0][2] as string,
          );
        }

        return null;
      }),
    );
  }

  public drop(interactiveId: string, itemId: string): Observable<boolean> {
    return defer(() =>
      from(
        this.astraClient.executeStmt(this.deleteStmt, [
          [interactiveId, 'string'],
          [itemId, 'string'],
        ]),
      ),
    ).pipe(
      map((result) => {
        return !!result[0][0];
      }),
    );
  }

  public remove(interactiveId: string): Observable<boolean> {
    return defer(() =>
      from(
        this.astraClient.executeStmt(this.removeStmt, [
          [interactiveId, 'string'],
        ]),
      ),
    ).pipe(
      map(() => {
        return true;
      }),
    );
  }
}
