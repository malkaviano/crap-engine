export interface EventBrokerInterface {
  consume(): Promise<void>;
  produce(content: Buffer): Promise<void>;
}
