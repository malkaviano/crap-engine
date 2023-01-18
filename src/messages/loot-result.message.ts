import { ResultMessage } from '@messages/result.message';
import { ItemEntityInterface } from '@interfaces/item-entity.interface';

export type LootResultMessage = ResultMessage & {
  readonly item: ItemEntityInterface;
};
