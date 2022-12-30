import { Injectable } from '@nestjs/common';

import {
  Query,
  Row,
  Value,
  Values,
} from '@stargate-oss/stargate-grpc-node-client';

import { AstraClient } from '@infra/astra-client/astra-client';
import { ItemStoreInterface } from '@interfaces/item-store.interface';
import { ConfigValuesHelper } from '@root/helpers/config-values.helper.service';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { ItemDefinition } from '@definitions/item.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { WeaponInterface } from '@interfaces/weapon.interface';
import { ConsumeInterface } from '@interfaces/consume.interface';
import { InfraError } from '@errors/infra.error';
import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';

type QueryInfo = {
  readonly stmt: string;
  readonly values: Values;
};

type ItemStored = {
  readonly identity: { name: string; label: string; description: string };
  readonly category: string;
  readonly usability: string;
  readonly skillName: string | null;
  readonly weapon: string | null;
  readonly consumable: string | null;
  readonly readable: string | null;
};

@Injectable()
export class ItemStoreService implements ItemStoreInterface {
  private readonly fields = [
    'name',
    'category',
    'usability',
    'label',
    'description',
    'skillname',
    'weapon',
    'consumable',
    'readable',
  ].join(',');

  private readonly weaponInsertStmt: string;

  private readonly consumableInsertStmt: string;

  private readonly selectStmt: string;

  private readonly deleteStmt: string;

  constructor(
    private readonly astraClient: AstraClient,
    private readonly configValuesHelper: ConfigValuesHelper,
    private readonly logger: CustomLoggerHelper,
  ) {
    this.logger.setContext(ItemStoreService.name);

    this.weaponInsertStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items ` +
      '(name,category,usability,label,description,skillname,weapon) values(?,?,?,?,?,?,?);';

    this.consumableInsertStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items ` +
      '(name,category,usability,label,description,skillname,consumable) values(?,?,?,?,?,?,?);';

    this.selectStmt = `select ${this.fields} from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items where name = ?;`;

    this.deleteStmt = `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items where name = ?;`;
  }

  public async getItem(name: string): Promise<ItemDefinition | null> {
    try {
      const nameValue = this.newStringValue(name);

      const queryValues = new Values();

      queryValues.setValuesList([nameValue]);

      const raw = await this.astraClient.executeQuery(
        this.selectStmt,
        queryValues,
      );

      const rows = raw.getResultSet()?.getRowsList();

      if (rows?.length) {
        const items = this.extractItems(rows);

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
      const { stmt, values } = this.queryInfo(item);

      await this.astraClient.executeQuery(stmt, values);
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  public async removeItem(name: string): Promise<void> {
    try {
      const queryValues = new Values();

      const nameValue = this.newStringValue(name);

      queryValues.setValuesList([nameValue]);

      await this.astraClient.executeQuery(this.deleteStmt, queryValues);
    } catch (error) {
      this.logger.error(error.message, error);

      throw new InfraError(error.message);
    }
  }

  private extractItems(rows: Row[]): ItemDefinition[] {
    return rows
      .map((r) => {
        const values = r.getValuesList();

        const skillName = values[5].hasString() ? values[5].getString() : null;

        const weapon = values[6].hasString() ? values[6].getString() : null;

        const consumable = values[7].hasString() ? values[7].getString() : null;

        const readable = values[8].hasString() ? values[8].getString() : null;

        return this.inflateItem({
          identity: {
            name: values[0].getString(),
            label: values[3].getString(),
            description: values[4].getString(),
          },
          category: values[1].getString(),
          usability: values[2].getString(),
          skillName,
          weapon,
          consumable,
          readable,
        });
      })
      .filter((element): element is ItemDefinition => {
        return element !== null;
      });
  }

  private inflateItem(stored: ItemStored): ItemDefinition | null {
    if (
      stored['category'] === 'WEAPON' &&
      stored['weapon'] &&
      stored['skillName']
    ) {
      const weapon: WeaponInterface = JSON.parse(stored['weapon']);

      return new WeaponDefinition(
        stored['identity'],
        stored['usability'],
        stored['skillName'],
        weapon.dodgeable,
        weapon.energyActivation,
        weapon.damage,
      );
    } else if (stored['category'] === 'CONSUMABLE' && stored['consumable']) {
      const consume: ConsumeInterface = JSON.parse(stored['consumable']);

      return new ConsumableDefinition(
        stored['identity'],
        stored['usability'],
        stored['skillName'],
        consume,
      );
    }

    return null;
  }

  private newStringValue(value: string | null) {
    const strValue = new Value();

    if (value) {
      strValue.setString(value);
    } else {
      strValue.setNull();
    }

    return strValue;
  }

  private queryInfo(item: ItemDefinition): QueryInfo {
    if (item instanceof WeaponDefinition) {
      return this.newWeapon(item);
    }

    if (item instanceof ConsumableDefinition) {
      return this.newConsumable(item);
    }

    throw new Error('loading wrong item format');
  }

  private newWeapon(weapon: WeaponDefinition): QueryInfo {
    const queryValues = new Values();

    const nameValue = this.newStringValue(weapon.name);

    const labelValue = this.newStringValue(weapon.label);

    const descriptionValue = this.newStringValue(weapon.description);

    const categoryValue = this.newStringValue(weapon.category);

    const usabilityValue = this.newStringValue(weapon.usability);

    const skillNameValue = this.newStringValue(weapon.skillName);

    const weaponValue = this.newStringValue(
      JSON.stringify({
        damage: weapon.damage,
        dodgeable: weapon.dodgeable,
        energyActivation: weapon.energyActivation,
      }),
    );

    queryValues.setValuesList([
      nameValue,
      categoryValue,
      usabilityValue,
      labelValue,
      descriptionValue,
      skillNameValue,
      weaponValue,
    ]);

    return { stmt: this.weaponInsertStmt, values: queryValues };
  }

  private newConsumable(consumable: ConsumableDefinition): QueryInfo {
    const queryValues = new Values();

    const nameValue = this.newStringValue(consumable.name);

    const labelValue = this.newStringValue(consumable.label);

    const descriptionValue = this.newStringValue(consumable.description);

    const categoryValue = this.newStringValue(consumable.category);

    const usabilityValue = this.newStringValue(consumable.usability);

    const skillNameValue = this.newStringValue(consumable.skillName);

    const consumeValue = this.newStringValue(
      JSON.stringify(consumable.consume),
    );

    queryValues.setValuesList([
      nameValue,
      categoryValue,
      usabilityValue,
      labelValue,
      descriptionValue,
      skillNameValue,
      consumeValue,
    ]);

    return { stmt: this.consumableInsertStmt, values: queryValues };
  }
}
