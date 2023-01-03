import { mock, reset } from 'ts-mockito';

import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';
import { ItemStoreService } from '@root/infra/stores/item.store';
import { DiceSetHelper } from '@root/helpers/dice-set.helper.service';

export const mockedCustomLoggerHelper = mock(CustomLoggerHelper);

export const mockedItemStore = mock(ItemStoreService);

export const mockedDiceSetHelper = mock(DiceSetHelper);

export const resetMocked = () => {
  reset(mockedCustomLoggerHelper);

  reset(mockedItemStore);

  reset(mockedDiceSetHelper);
};
