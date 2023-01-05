import { Injectable } from '@nestjs/common';

import * as grpc from '@grpc/grpc-js';
import {
  Batch,
  ColumnSpec,
  promisifyStargateClient,
  Query,
  Response,
  ResultSet,
  Row,
  StargateBearerToken,
  StargateClient,
  Value,
  Values,
} from '@stargate-oss/stargate-grpc-node-client';
import { PromisifiedStargateClient } from '@stargate-oss/stargate-grpc-node-client/lib/util/promise';

import { ConfigValuesHelper } from '@root/helpers/config-values.helper.service';

@Injectable()
export class AstraClient {
  private readonly promisifyStargateClient: PromisifiedStargateClient;

  constructor(private readonly configValuesHelper: ConfigValuesHelper) {
    // Astra DB configuration
    const astra_uri = `${this.configValuesHelper.ASTRA_DB_ID}-${this.configValuesHelper.ASTRA_DB_REGION}.apps.astra.datastax.com:443`;
    const bearer_token = `AstraCS:${this.configValuesHelper.ASTRA_TOKEN}`;

    // Set up the authentication
    const bearerToken = new StargateBearerToken(bearer_token);
    const credentials = grpc.credentials.combineChannelCredentials(
      grpc.credentials.createSsl(),
      bearerToken,
    );

    // Create the gRPC client
    const stargateClient = new StargateClient(astra_uri, credentials);

    // Create a promisified version of the client
    this.promisifyStargateClient = promisifyStargateClient(stargateClient);
  }

  public async executeQuery(
    stmt: string,
    values?: Values,
  ): Promise<(string | number | boolean | null)[][]> {
    const query = new Query();

    query.setValues(values);

    query.setCql(stmt);

    const response = await this.promisifyStargateClient.executeQuery(query);

    const cols = response.getResultSet()?.getColumnsList();

    const rows = response.getResultSet()?.getRowsList();

    return this.typeConvert(cols ?? [], rows ?? []);
  }

  public async executeBatch(batch: Batch): Promise<Response> {
    return this.promisifyStargateClient.executeBatch(batch);
  }

  public newObjectValue(value: unknown): Value {
    const intValue = new Value();

    if (value) {
      intValue.setString(JSON.stringify(value));
    } else {
      intValue.setNull(new Value.Null());
    }

    return intValue;
  }

  public newIntValue(value: number): Value {
    const intValue = new Value();

    if (value) {
      intValue.setInt(value);
    } else {
      intValue.setNull(new Value.Null());
    }

    return intValue;
  }

  public newBooleanValue(value: boolean): Value {
    const boolValue = new Value();

    if (value) {
      boolValue.setBoolean(value);
    } else {
      boolValue.setNull(new Value.Null());
    }

    return boolValue;
  }

  public newStringValue(value: string | null): Value {
    const strValue = new Value();

    if (value) {
      strValue.setString(value);
    } else {
      strValue.setNull(new Value.Null());
    }

    return strValue;
  }

  public createValues(...values: Value[]): Values {
    const queryValues = new Values();

    queryValues.setValuesList(values);

    return queryValues;
  }

  private typeConvert(
    cols: ColumnSpec[],
    rows: Row[],
  ): (string | number | boolean | null)[][] {
    const fBoolean = (v: Value) => (v.hasBoolean() ? v.getBoolean() : null);

    const fString = (v: Value) => (v.hasString() ? v.getString() : null);

    const fNumber = (v: Value) => {
      let value: number | null = null;

      if (v.hasInt()) {
        value = v.getInt();
      } else if (v.hasDouble()) {
        value = v.getDouble();
      }

      return value;
    };

    const tokens: (typeof fBoolean | typeof fString | typeof fNumber)[] = [];

    for (const element of cols) {
      const type = element.getType()?.getBasic();

      if (type) {
        if ([4].includes(type)) {
          tokens.push(fBoolean);
        } else if ([1, 10, 13].includes(type)) {
          tokens.push(fString);
        } else if ([19, 20, 7, 8, 9, 2, 6].includes(type)) {
          tokens.push(fNumber);
        }
      }
    }

    const r = rows.map((r) => {
      return r.getValuesList().map((v, i) => {
        return tokens[i](v);
      });
    });

    return r;
  }
}
