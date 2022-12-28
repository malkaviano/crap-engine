import { Test, TestingModule } from '@nestjs/testing';

import { ConfigValuesHelper } from '@root/helpers/config-values.helper';

describe('ConfigValuesService', () => {
  let service: ConfigValuesHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigValuesHelper],
    }).compile();

    service = module.get<ConfigValuesHelper>(ConfigValuesHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
