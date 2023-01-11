import { Injectable, OnModuleDestroy } from '@nestjs/common';

import * as grpc from '@grpc/grpc-js';
import {
  Batch,
  BatchQuery,
  ColumnSpec,
  promisifyStargateClient,
  Query,
  Row,
  StargateBearerToken,
  StargateClient,
  Value,
  Values,
} from '@stargate-oss/stargate-grpc-node-client';
import { PromisifiedStargateClient } from '@stargate-oss/stargate-grpc-node-client/lib/util/promise';

import { ConfigValuesHelper } from '@root/helpers/config-values.helper.service';

type QueryResult = string | number | boolean | null;

@Injectable()
export class AstraClient implements OnModuleDestroy {
  private readonly promisifyStargateClient: PromisifiedStargateClient;

  private readonly stargateClient: StargateClient;

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
    this.stargateClient = new StargateClient(astra_uri, credentials);

    // Create a promisified version of the client
    this.promisifyStargateClient = promisifyStargateClient(this.stargateClient);
  }

  public onModuleDestroy() {
    this.stargateClient.close();
  }

  public async executeStmt(
    stmt: string,
    params: string[][],
  ): Promise<QueryResult[][]> {
    const values = params.map((pair) => {
      if (pair[1] === 'string') {
        return this.newStringValue(pair[0]);
      } else if (pair[1] === 'integer') {
        return this.newIntValue(parseInt(pair[0]));
      } else {
        return this.newBooleanValue(pair[0] === 'true');
      }
    });

    return this.executeQuery(stmt, this.createValues(values));
  }

  private async executeQuery(
    stmt: string,
    values?: Values,
  ): Promise<QueryResult[][]> {
    const query = new Query();

    query.setValues(values);

    query.setCql(stmt);

    const response = await this.promisifyStargateClient.executeQuery(query);

    const cols = response.getResultSet()?.getColumnsList();

    const rows = response.getResultSet()?.getRowsList();

    return this.typeConvert(cols ?? [], rows ?? []);
  }

  private async executeBatch(
    queries: BatchQuery[],
  ): Promise<(string | number | boolean | null)[][]> {
    const batch = new Batch();

    batch.setQueriesList(queries);

    const response = await this.promisifyStargateClient.executeBatch(batch);

    const cols = response.getResultSet()?.getColumnsList();

    const rows = response.getResultSet()?.getRowsList();

    return this.typeConvert(cols ?? [], rows ?? []);
  }

  private newIntValue(value: number): Value {
    const intValue = new Value();

    if (value) {
      intValue.setInt(value);
    } else {
      intValue.setNull(new Value.Null());
    }

    return intValue;
  }

  private newBooleanValue(value: boolean): Value {
    const boolValue = new Value();

    if (value) {
      boolValue.setBoolean(value);
    } else {
      boolValue.setNull(new Value.Null());
    }

    return boolValue;
  }

  private newStringValue(value: string | null): Value {
    const strValue = new Value();

    if (value) {
      strValue.setString(value);
    } else {
      strValue.setNull(new Value.Null());
    }

    return strValue;
  }

  private createValues(values: Value[]): Values {
    const queryValues = new Values();

    queryValues.setValuesList(values);

    return queryValues;
  }

  private createBatchQuery(stmt: string, values?: Values): BatchQuery {
    const batchQuery = new BatchQuery();

    batchQuery.setCql(stmt);

    batchQuery.setValues(values);

    return batchQuery;
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
