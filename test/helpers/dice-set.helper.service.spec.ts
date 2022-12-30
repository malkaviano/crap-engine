import { Test, TestingModule } from '@nestjs/testing';

import { DiceSetHelper } from '@root/helpers/dice-set.helper.service';

describe('DiceSetHelper', () => {
  let service: DiceSetHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiceSetHelper],
    }).compile();

    service = module.get<DiceSetHelper>(DiceSetHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
