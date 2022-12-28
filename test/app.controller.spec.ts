import { Test, TestingModule } from '@nestjs/testing';

import { instance, mock } from 'ts-mockito';

import { AppController } from '@root/app.controller';
import { AppService } from '@root/app.service';
import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper';
import { ConfigValuesHelper } from '@root/helpers/config-values.helper';

describe('AppController', () => {
  let appController: AppController;

  const mockedCustomLoggerHelper = mock(CustomLoggerHelper);
  const mockedConfigValuesHelper = mock(ConfigValuesHelper);

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: CustomLoggerHelper,
          useValue: instance(mockedCustomLoggerHelper),
        },
        {
          provide: ConfigValuesHelper,
          useValue: instance(mockedConfigValuesHelper),
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
