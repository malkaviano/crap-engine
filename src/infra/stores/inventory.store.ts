import { Injectable, OnModuleInit } from '@nestjs/common';

import { InventoryStoreInterface } from '@interfaces/inventory-store.interface';
import { AstraClient } from '@root/infra/clients/astra.client';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';
import { InfraError } from '@errors/infra.error';
import { IdentifiableInterface } from '@interfaces/identifiable.interface';
import { WeaponEntity } from '@entities/weapon.entity';
import { ApplicationError } from '@errors/application.error';
import { InventorySummaryInterface } from '@interfaces/inventory-summary.interface';

@Injectable()
export class InventoryStore implements OnModuleInit, InventoryStoreInterface {
  private readonly fields: string;

  private readonly selectStmt: string;

  private readonly insertStmt: string;

  private readonly deleteStmt: string;

  private readonly equipStmt: string;

  private readonly unEquipStmt: string;

  private readonly summaryStmt: string;

  private readonly installStmt: string;

  private readonly uninstallStmt: string;

  constructor(
    private readonly astraClient: AstraClient,
    private readonly configValuesHelper: ConfigValuesHelper,
    private readonly logger: CustomLoggerHelper,
  ) {
    this.fields = ['interactive_id', 'item_id', 'item_payload'].join(',');

    this.insertStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      `(${this.fields}) values(?,?,?);`;

    this.selectStmt =
      `select ${this.fields} from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      'where interactive_id = ? and item_id = ?;';

    this.deleteStmt =
      `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      'where interactive_id = ? and item_id = ?;';

    this.equipStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      `(interactive_id, equipped) values(?,?);`;

    this.unEquipStmt =
      `update ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      'set equipped = null where interactive_id = ?;';

    this.summaryStmt =
      'select count(*) as quantity, loot_token, equipped ' +
      `from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      'where interactive_id = ?;';

    this.installStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      `(interactive_id, loot_token) values(?,?);`;

    this.uninstallStmt =
      `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
      'where interactive_id = ?;';
  }

  public async onModuleInit(): Promise<void> {
    await this.astraClient.executeQuery(
      `CREATE TABLE IF NOT EXISTS ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.inventory ` +
        '(interactive_id text,item_id text,item_payload text,' +
        'loot_token text static,equipped text static,' +
        'PRIMARY KEY (interactive_id, item_id));',
    );
  }

  public async store(
    interactiveId: string,
    itemEntity: IdentifiableInterface,
  ): Promise<void> {
    try {
      const interactiveIdValue = this.astraClient.newStringValue(interactiveId);

      const itemIdValue = this.astraClient.newStringValue(itemEntity.id);

      const weaponValue = this.astraClient.newObjectValue(itemEntity);

      await this.astraClient.executeQuery(
        this.insertStmt,
        this.astraClient.createValues(
          interactiveIdValue,
          itemIdValue,
          weaponValue,
        ),
      );
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async look(
    interactiveId: string,
    itemId: string,
  ): Promise<IdentifiableInterface | null> {
    try {
      const interactiveIdValue = this.astraClient.newStringValue(interactiveId);

      const itemIdValue = this.astraClient.newStringValue(itemId);

      const response = await this.astraClient.executeQuery(
        this.selectStmt,
        this.astraClient.createValues(interactiveIdValue, itemIdValue),
      );

      const rows = response.getResultSet()?.getRowsList();

      if (rows?.length) {
        const obj = JSON.parse(rows[0].getValuesList()[2].getString());

        const category = Object.getOwnPropertyDescriptor(obj, 'category');

        if (category && category.value === 'WEAPON') {
          return WeaponEntity.create(
            obj.id,
            {
              name: obj.name,
              label: obj.label,
              description: obj.description,
            },
            obj.usability,
            obj.skillName,
            obj.dodgeable,
            obj.energyActivation,
            obj.damage,
          );
        }
      }

      return null;
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async drop(interactiveId: string, itemId: string): Promise<void> {
    try {
      const interactiveIdValue = this.astraClient.newStringValue(interactiveId);

      const itemIdValue = this.astraClient.newStringValue(itemId);

      await this.astraClient.executeQuery(
        this.deleteStmt,
        this.astraClient.createValues(interactiveIdValue, itemIdValue),
      );
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async equip(actorId: string, weaponId: string): Promise<void> {
    const weapon = await this.look(actorId, weaponId);

    if (!(weapon instanceof WeaponEntity)) {
      throw new ApplicationError('Wrong item type to equip');
    }

    await this.drop(actorId, weaponId);

    await this.unEquip(actorId);

    try {
      const interactiveIdValue = this.astraClient.newStringValue(actorId);

      const weaponValue = this.astraClient.newObjectValue(weapon);

      await this.astraClient.executeQuery(
        this.equipStmt,
        this.astraClient.createValues(interactiveIdValue, weaponValue),
      );
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async unEquip(actorId: string): Promise<void> {
    const summary = await this.summary(actorId);

    if (summary.equipped) {
      await this.store(actorId, summary.equipped);
    }

    try {
      const interactiveIdValue = this.astraClient.newStringValue(actorId);

      await this.astraClient.executeQuery(
        this.unEquipStmt,
        this.astraClient.createValues(interactiveIdValue),
      );
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async summary(actorId: string): Promise<InventorySummaryInterface> {
    try {
      const interactiveIdValue = this.astraClient.newStringValue(actorId);

      const response = await this.astraClient.executeQuery(
        this.summaryStmt,
        this.astraClient.createValues(interactiveIdValue),
      );

      const rows = response.getResultSet()?.getRowsList();

      if (!rows?.length) {
        throw new ApplicationError('Actor does not exist');
      }

      const values = rows[0].getValuesList();

      const quantity = values[0].getInt();

      const lootToken = values[1].hasString() ? values[1].getString() : null;

      const weapon = values[2].hasString()
        ? JSON.parse(values[2].getString())
        : null;

      let equipped: WeaponEntity | null = null;

      if (weapon) {
        equipped = WeaponEntity.create(
          weapon.id,
          {
            name: weapon.name,
            label: weapon.label,
            description: weapon.description,
          },
          weapon.usability,
          weapon.skillName,
          weapon.dodgeable,
          weapon.energyActivation,
          weapon.damage,
        );
      }

      return {
        quantity,
        lootToken,
        equipped,
      };
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async setLootToken(
    interactiveId: string,
    lootToken: string,
  ): Promise<void> {
    try {
      const interactiveIdValue = this.astraClient.newStringValue(interactiveId);

      const lootTokenValue = this.astraClient.newStringValue(lootToken);

      await this.astraClient.executeQuery(
        this.installStmt,
        this.astraClient.createValues(interactiveIdValue, lootTokenValue),
      );
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
}
