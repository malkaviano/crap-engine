import { Injectable } from '@nestjs/common';

import * as grpc from '@grpc/grpc-js';
import {
  Batch,
  promisifyStargateClient,
  Query,
  Response,
  StargateBearerToken,
  StargateClient,
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

  public async executeQuery(stmt: string, values?: Values): Promise<Response> {
    const query = new Query();

    query.setValues(values);

    query.setCql(stmt);

    return this.promisifyStargateClient.executeQuery(query);
  }

  public async executeBatch(batch: Batch): Promise<Response> {
    return this.promisifyStargateClient.executeBatch(batch);
  }
}
