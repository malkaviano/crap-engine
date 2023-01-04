import { Injectable, OnModuleInit } from '@nestjs/common';

import { InventoryStoreInterface } from '@interfaces/inventory-store.interface';
import { AstraClient } from '@root/infra/clients/astra.client';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { Value, Values } from '@stargate-oss/stargate-grpc-node-client';
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
      const queryValues = new Values();

      const interactiveIdValue = this.newStringValue(interactiveId);

      const itemIdValue = this.newStringValue(itemEntity.id);

      const weaponValue = this.newObjectValue(itemEntity);

      queryValues.setValuesList([interactiveIdValue, itemIdValue, weaponValue]);

      await this.astraClient.executeQuery(this.insertStmt, queryValues);
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
      const queryValues = new Values();

      const interactiveIdValue = this.newStringValue(interactiveId);

      const itemIdValue = this.newStringValue(itemId);

      queryValues.setValuesList([interactiveIdValue, itemIdValue]);

      const response = await this.astraClient.executeQuery(
        this.selectStmt,
        queryValues,
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
      const queryValues = new Values();

      const interactiveIdValue = this.newStringValue(interactiveId);

      const itemIdValue = this.newStringValue(itemId);

      queryValues.setValuesList([interactiveIdValue, itemIdValue]);

      await this.astraClient.executeQuery(this.deleteStmt, queryValues);
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
      const queryValues = new Values();

      const interactiveIdValue = this.newStringValue(actorId);

      const weaponValue = this.newObjectValue(weapon);

      queryValues.setValuesList([interactiveIdValue, weaponValue]);

      await this.astraClient.executeQuery(this.equipStmt, queryValues);
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
      const queryValues = new Values();

      const interactiveIdValue = this.newStringValue(actorId);

      queryValues.setValuesList([interactiveIdValue]);

      await this.astraClient.executeQuery(this.unEquipStmt, queryValues);
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async summary(actorId: string): Promise<InventorySummaryInterface> {
    try {
      const queryValues = new Values();

      const interactiveIdValue = this.newStringValue(actorId);

      queryValues.setValuesList([interactiveIdValue]);

      const response = await this.astraClient.executeQuery(
        this.summaryStmt,
        queryValues,
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
      const queryValues = new Values();

      const interactiveIdValue = this.newStringValue(interactiveId);

      const lootTokenValue = this.newStringValue(lootToken);

      queryValues.setValuesList([interactiveIdValue, lootTokenValue]);

      await this.astraClient.executeQuery(this.installStmt, queryValues);
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async remove(interactiveId: string): Promise<void> {
    try {
      const queryValues = new Values();

      const interactiveIdValue = this.newStringValue(interactiveId);

      queryValues.setValuesList([interactiveIdValue]);

      await this.astraClient.executeQuery(this.uninstallStmt, queryValues);
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  private newObjectValue(value: unknown) {
    const intValue = new Value();

    if (value) {
      intValue.setString(JSON.stringify(value));
    } else {
      intValue.setNull(new Value.Null());
    }

    return intValue;
  }

  private newIntValue(value: number) {
    const intValue = new Value();

    if (value) {
      intValue.setInt(value);
    } else {
      intValue.setNull(new Value.Null());
    }

    return intValue;
  }

  private newBooleanValue(value: boolean) {
    const boolValue = new Value();

    if (value) {
      boolValue.setBoolean(value);
    } else {
      boolValue.setNull(new Value.Null());
    }

    return boolValue;
  }

  private newStringValue(value: string | null) {
    const strValue = new Value();

    if (value) {
      strValue.setString(value);
    } else {
      strValue.setNull(new Value.Null());
    }

    return strValue;
  }
}
