import { Injectable } from '@nestjs/common';

import * as grpc from '@grpc/grpc-js';
import {
  Batch,
  promisifyStargateClient,
  Query,
  Response,
  ResultSet,
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
  ): Promise<Value[][] | undefined> {
    const query = new Query();

    query.setValues(values);

    query.setCql(stmt);

    const response = await this.promisifyStargateClient.executeQuery(query);

    return response
      .getResultSet()
      ?.getRowsList()
      .map((r) => r.getValuesList());
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
}
