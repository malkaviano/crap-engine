import { Value } from '@stargate-oss/stargate-grpc-node-client';

export type QueryInfo = {
  readonly weapon: Value;
  readonly consumable: Value;
  readonly readable: Value;
};
