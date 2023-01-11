export interface EventBrokerInterface {
  consume(): Promise<string>;
  produce(content: Buffer): Promise<void>;
}
