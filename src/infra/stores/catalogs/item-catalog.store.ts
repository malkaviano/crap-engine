import { Injectable, OnModuleInit } from '@nestjs/common';

import { Row, Value, Values } from '@stargate-oss/stargate-grpc-node-client';

import { AstraClient } from '@infra/astra-client/astra.client';
import { ItemCatalogStoreInterface } from '@interfaces/item-store.interface';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { ItemDefinition } from '@definitions/item.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { WeaponInterface } from '@interfaces/weapon.interface';
import { ConsumeInterface } from '@interfaces/consume.interface';
import { InfraError } from '@errors/infra.error';
import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';
import { ReadableDefinition } from '@definitions/readable.definition';
import { ItemStored } from '@root/infra/stores/catalogs/item-stored.type';
import { QueryInfo } from '@infra/stores/catalogs/query-info.type';
import { ReadableInterface } from '@interfaces/readable.interface';

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
  ) {
    this.fields = [
      'category',
      'name',
      'usability',
      'label',
      'description',
      'skillname',
      'weapon',
      'consumable',
      'readable',
    ].join(',');

    this.insertStmt =
      `insert into ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items_catalog ` +
      `(${this.fields}) values(?,?,?,?,?,?,?,?,?);`;

    this.selectStmt = `select ${this.fields} from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items_catalog where category = ? and name = ?;`;

    this.deleteStmt = `delete from ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items_catalog where category = ? and name = ?;`;
  }

  public async onModuleInit(): Promise<void> {
    await this.astraClient.executeQuery(
      `CREATE TABLE IF NOT EXISTS ${this.configValuesHelper.ASTRA_DB_KEYSPACE}.items_catalog ` +
        '(name text,category text,usability text,consumable text,' +
        'description text,label text,readable text,skillname text,' +
        'weapon text,PRIMARY KEY (category, name));',
    );
  }

  public async getItem(
    category: string,
    name: string,
  ): Promise<ItemDefinition | null> {
    try {
      const queryValues = new Values();

      const categoryValue = this.newStringValue(category);

      const nameValue = this.newStringValue(name);

      queryValues.setValuesList([categoryValue, nameValue]);

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

  public async removeItem(category: string, name: string): Promise<void> {
    try {
      const queryValues = new Values();

      const categoryValue = this.newStringValue(category);

      const nameValue = this.newStringValue(name);

      queryValues.setValuesList([categoryValue, nameValue]);

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
            name: values[1].getString(),
            label: values[3].getString(),
            description: values[4].getString(),
          },
          category: values[0].getString(),
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
    } else if (stored['category'] === 'READABLE' && stored['readable']) {
      const readable: ReadableInterface = JSON.parse(stored['readable']);

      return new ReadableDefinition(
        stored['identity'],
        stored['usability'],
        stored['skillName'],
        readable,
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
      categoryValue,
      nameValue,
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
