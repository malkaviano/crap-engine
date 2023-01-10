import { Injectable, OnModuleInit } from '@nestjs/common';

import { InventoryStoreInterface } from '@interfaces/inventory-store.interface';
import { AstraClient } from '@root/infra/clients/astra.client';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';
import { InfraError } from '@errors/infra.error';
import { IdentifiableInterface } from '@interfaces/identifiable.interface';
import { WeaponEntity } from '@entities/weapon.entity';
import { ConverterHelper } from '@helpers/converter.helper.service';
import { ConsumableEntity } from '@entities/consumable.entity';
import { ReadableEntity } from '@entities/readable.entity';

@Injectable()
export class InventoryStore implements OnModuleInit, InventoryStoreInterface {
  private readonly selectStmt: string;

  private readonly insertStmt: string;

  private readonly deleteStmt: string;

  private readonly uninstallStmt: string;

  constructor(
    private readonly astraClient: AstraClient,
    private readonly configValuesHelper: ConfigValuesHelper,
    private readonly logger: CustomLoggerHelper,
    private readonly converterHelperService: ConverterHelper,
  ) {
    const fields = ['interactive_id', 'item_id', 'item_payload'].join(',');

    this.insertStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      `(${fields}) values(?,?,?) IF NOT EXISTS;`;

    this.selectStmt =
      `select ${fields} ` +
      ` from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      ' where interactive_id = ? and item_id = ?;';

    this.deleteStmt =
      `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      'where interactive_id = ? and item_id = ? IF EXISTS;';

    this.uninstallStmt =
      `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      'where interactive_id = ?;';
  }

  public async onModuleInit(): Promise<void> {
    await this.astraClient.executeQuery(
      'CREATE TABLE IF NOT EXISTS ' +
        ` ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
        '(interactive_id text,' +
        'item_id text,' +
        'item_payload text,' +
        'PRIMARY KEY (interactive_id, item_id));',
    );
  }

  public async store(
    interactiveId: string,
    itemEntity: IdentifiableInterface,
  ): Promise<boolean> {
    try {
      const interactiveIdValue = this.astraClient.newStringValue(interactiveId);

      const itemIdValue = this.astraClient.newStringValue(itemEntity.id);

      const weaponValue = this.astraClient.newObjectValue(itemEntity);

      const r = await this.astraClient.executeQuery(
        this.insertStmt,
        this.astraClient.createValues(
          interactiveIdValue,
          itemIdValue,
          weaponValue,
        ),
      );

      return !!r[0][0];
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async look<T extends WeaponEntity | ConsumableEntity | ReadableEntity>(
    interactiveId: string,
    itemId: string,
  ): Promise<T | null> {
    try {
      const interactiveIdValue = this.astraClient.newStringValue(interactiveId);

      const itemIdValue = this.astraClient.newStringValue(itemId);

      const values = await this.astraClient.executeQuery(
        this.selectStmt,
        this.astraClient.createValues(interactiveIdValue, itemIdValue),
      );

      if (values.length) {
        const obj = JSON.parse(values[0][2] as string);

        return this.converterHelperService.inflateItemEntity<T>(obj);
      }

      return null;
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async drop(interactiveId: string, itemId: string): Promise<boolean> {
    try {
      const interactiveIdValue = this.astraClient.newStringValue(interactiveId);

      const itemIdValue = this.astraClient.newStringValue(itemId);

      const r = await this.astraClient.executeQuery(
        this.deleteStmt,
        this.astraClient.createValues(interactiveIdValue, itemIdValue),
      );

      return !!r[0][0];
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async remove(interactiveId: string): Promise<void> {
    try {
      const interactiveIdValue = this.astraClient.newStringValue(interactiveId);

      await this.astraClient.executeQuery(
        this.uninstallStmt,
        this.astraClient.createValues(interactiveIdValue),
      );
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async loot(
    looterId: string,
    interactiveId: string,
    itemId: string,
  ): Promise<boolean> {
    const itemEntity = await this.look(interactiveId, itemId);

    if (itemEntity) {
      const dropped = await this.drop(interactiveId, itemId);

      if (dropped) {
        const r = await this.store(looterId, itemEntity);

        return r;
      }
    }

    return false;
  }
}
