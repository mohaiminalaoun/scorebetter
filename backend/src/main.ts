import './vercel-module-path';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { assertAuthConfig } from './config/env';

// Local convenience only. On Vercel the variables come from project settings.
function loadLocalEnvFile() {
  try {
    process.loadEnvFile();
  } catch {
    // No .env file, which is expected in production.
  }
}

async function bootstrap() {
  loadLocalEnvFile();
  // Fail on boot with a clear message rather than on the first sign-in.
  assertAuthConfig();

  const app = await NestFactory.create(AppModule);
  // Explicit origins only: credentials plus a wildcard-ish origin is how
  // sessions get read cross-site. In production this is all same-origin anyway.
  app.enableCors({
    origin: ['http://localhost:5173', 'https://scorebetter.vercel.app'],
    credentials: true,
  });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}

bootstrap();
