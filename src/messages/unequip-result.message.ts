import { ResultMessage } from '@messages/result.message';
import { ItemEntityInterface } from '@interfaces/item-entity.interface';

export type UnEquipResultMessage = ResultMessage & {
  readonly item: ItemEntityInterface | null;
};
