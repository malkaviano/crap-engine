import { Test, TestingModule } from '@nestjs/testing';

import { ConverterHelper } from '@helpers/converter.helper.service';

describe('ConverterHelperService', () => {
  let service: ConverterHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConverterHelper],
    }).compile();

    service = module.get<ConverterHelper>(ConverterHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
