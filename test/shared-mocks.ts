import { mock, reset } from 'ts-mockito';

import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';
import { ItemCatalogStore } from '@root/infra/stores/catalogs/item-catalog.store';
import { DiceSetHelper } from '@root/helpers/dice-set.helper.service';

export const mockedCustomLoggerHelper = mock(CustomLoggerHelper);

export const mockedItemStore = mock(ItemCatalogStore);

export const mockedDiceSetHelper = mock(DiceSetHelper);

export const resetMocked = () => {
  reset(mockedCustomLoggerHelper);

  reset(mockedItemStore);

  reset(mockedDiceSetHelper);
};
