import { Test, TestingModule } from '@nestjs/testing';

import { GeneratorHelper as GeneratorHelper } from '@helpers/generator.helper.service';

describe('GeneratorHelper', () => {
  let service: GeneratorHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneratorHelper],
    }).compile();

    service = module.get<GeneratorHelper>(GeneratorHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
