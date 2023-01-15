import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import 'dotenv/config';
import helmet from 'helmet';

import { AppModule } from '@root/app.module';
import { ApplicationExceptionFilter } from '@filters/application-exception.filter';
import { DateTimeHelper } from '@helpers/date-time.helper.service';
import { CustomLoggerHelper } from './helpers/custom-logger.helper.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const cl = app.get(CustomLoggerHelper);

  app.useGlobalFilters(new ApplicationExceptionFilter(cl));

  const config = new DocumentBuilder()
    .setTitle('CrapEngine')
    .setDescription('The CrapEngine API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const port = process.env.SERVER_PORT ?? 3000;

  await app.listen(port);

  const logger = new Logger();

  cl.log(`Server started on port ${port}`);
}

bootstrap();
