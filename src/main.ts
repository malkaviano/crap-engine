import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import 'dotenv/config';
import helmet from 'helmet';

import { AppModule } from '@root/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('ChangeME')
    .setDescription('The ChangeME API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const port = process.env.SERVER_PORT ?? 3000;

  await app.listen(port);

  const logger = new Logger();

  logger.log(`Server started on port ${port}`, 'SERVER');
}

bootstrap();
