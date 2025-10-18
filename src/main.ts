import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy for real IP behind reverse proxy (Cloud Run, nginx, etc.)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Global exception filters
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Get the underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance();

  // Disable ETag to prevent caching based on entity tags
  expressApp.disable('etag');

  // Add no-cache headers to prevent any caching
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // CORS configuration - Allow frontend and admin panel
  const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:4321,https://estilosushi.com')
    .split(',')
    .map(url => url.trim());

  const corsOrigins: (string | RegExp)[] = [...frontendUrls, /\.pages\.dev$/];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Nest API Sushi')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // /docs

  const port = Number(process.env.PORT || 8080);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
