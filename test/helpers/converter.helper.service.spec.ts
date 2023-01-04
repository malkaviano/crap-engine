import { Test, TestingModule } from '@nestjs/testing';

import { ConverterHelperService } from '@helpers/converter.helper.service';

describe('ConverterHelperService', () => {
  let service: ConverterHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConverterHelperService],
    }).compile();

    service = module.get<ConverterHelperService>(ConverterHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
