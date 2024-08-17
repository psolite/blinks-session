import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ACTIONS_CORS_HEADERS } from '@solana/actions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(
    {
      origin: ACTIONS_CORS_HEADERS['Access-Control-Allow-Origin'],
      methods: ACTIONS_CORS_HEADERS['Access-Control-Allow-Methods'],
      allowedHeaders: ACTIONS_CORS_HEADERS['Access-Control-Allow-Headers'],
    }
  )

  await app.listen(3000);
}
bootstrap();
