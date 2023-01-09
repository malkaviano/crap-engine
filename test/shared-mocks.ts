import { mock, reset } from 'ts-mockito';

import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';
import { ItemCatalogStore } from '@root/infra/stores/catalogs/item-catalog.store';
import { DiceSetHelper } from '@root/helpers/dice-set.helper.service';
import { GeneratorHelper } from '@helpers/generator.helper.service';

export const mockedCustomLoggerHelper = mock(CustomLoggerHelper);

export const mockedItemCatalogStore = mock(ItemCatalogStore);

export const mockedDiceSetHelper = mock(DiceSetHelper);

export const mockedGeneratorHelper = mock(GeneratorHelper);

export const resetMocked = () => {
  reset(mockedCustomLoggerHelper);

  reset(mockedItemCatalogStore);

  reset(mockedDiceSetHelper);

  reset(mockedGeneratorHelper);
};
