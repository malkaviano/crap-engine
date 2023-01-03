import { Injectable } from '@nestjs/common';

import { Row, Value, Values } from '@stargate-oss/stargate-grpc-node-client';

import { AstraClient } from '@infra/astra-client/astra-client';
import { ItemStoreInterface } from '@interfaces/item-store.interface';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { ItemDefinition } from '@definitions/item.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { WeaponInterface } from '@interfaces/weapon.interface';
import { ConsumeInterface } from '@interfaces/consume.interface';
import { InfraError } from '@errors/infra.error';
import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';
import { ReadableDefinition } from '@definitions/readable.definition';

type QueryInfo = {
  readonly weapon: Value;
  readonly consumable: Value;
  readonly readable: Value;
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

  private readonly insertStmt: string;

  private readonly selectStmt: string;

  private readonly deleteStmt: string;

  constructor(
    private readonly astraClient: AstraClient,
    private readonly configValuesHelper: ConfigValuesHelper,
    private readonly logger: CustomLoggerHelper,
  ) {
    this.logger.setContext(ItemStoreService.name);

    this.insertStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items ` +
      `(${this.fields}) values(?,?,?,?,?,?,?,?,?);`;

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
      const values = this.queryInfo(item);

      await this.astraClient.executeQuery(this.insertStmt, values);
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
      strValue.setNull(new Value.Null());
    }

    return strValue;
  }

  private queryInfo(item: ItemDefinition): Values {
    const queryValues = new Values();

    const nameValue = this.newStringValue(item.name);

    const labelValue = this.newStringValue(item.label);

    const descriptionValue = this.newStringValue(item.description);

    const categoryValue = this.newStringValue(item.category);

    const usabilityValue = this.newStringValue(item.usability);

    const skillNameValue = this.newStringValue(item.skillName);

    let values = [
      nameValue,
      categoryValue,
      usabilityValue,
      labelValue,
      descriptionValue,
      skillNameValue,
    ];

    if (item instanceof WeaponDefinition) {
      const { weapon, consumable, readable } = this.newWeapon(item);

      values = values.concat([weapon, consumable, readable]);
    }

    if (item instanceof ConsumableDefinition) {
      const { weapon, consumable, readable } = this.newConsumable(item);

      values = values.concat([weapon, consumable, readable]);
    }

    if (item instanceof ReadableDefinition) {
      const { weapon, consumable, readable } = this.newReadable(item);

      values = values.concat([weapon, consumable, readable]);
    }

    queryValues.setValuesList(values);

    return queryValues;
  }

  private newWeapon(weapon: WeaponDefinition): QueryInfo {
    const weaponValue = this.newStringValue(
      JSON.stringify({
        damage: weapon.damage,
        dodgeable: weapon.dodgeable,
        energyActivation: weapon.energyActivation,
      }),
    );

    const nullValue = new Value();

    nullValue.setNull(new Value.Null());

    return { weapon: weaponValue, consumable: nullValue, readable: nullValue };
  }

  private newConsumable(consumable: ConsumableDefinition): QueryInfo {
    const consumeValue = this.newStringValue(
      JSON.stringify(consumable.consume),
    );

    const nullValue = new Value();

    nullValue.setNull(new Value.Null());

    return {
      weapon: nullValue,
      consumable: consumeValue,
      readable: nullValue,
    };
  }

  private newReadable(readable: ReadableDefinition): QueryInfo {
    const readValue = this.newStringValue(JSON.stringify(readable.read));

    const nullValue = new Value();

    nullValue.setNull(new Value.Null());

    return {
      weapon: nullValue,
      consumable: nullValue,
      readable: readValue,
    };
  }
}
