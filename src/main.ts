import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Thrindle')
    .setDescription('Thrindle API Documentation')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local environment')
    .addTag('Thrindle')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const logger = new Logger('bootstrap');
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('PORT'), () => {
    return logger.log(`Server running on port ${configService.get('PORT')}`);
  });
}
bootstrap();
