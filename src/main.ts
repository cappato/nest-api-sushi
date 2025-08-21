import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Opcional: CORS si habrá front externo
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Nest API Sushi')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // /docs

  const port = Number(process.env.PORT || 8080);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
