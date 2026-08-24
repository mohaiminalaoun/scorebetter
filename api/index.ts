import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../backend/src/app.module';

let app: any = null;

async function initApp() {
  if (app) return app;
  
  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp)
  );
  nestApp.enableCors({ 
    origin: ['http://localhost:5173', /\.vercel\.app$/]
  });
  await nestApp.init();
  
  app = expressApp;
  return expressApp;
}

export default async (req: any, res: any) => {
  try {
    const expressApp = await initApp();
    return expressApp(req, res);
  } catch (err) {
    console.error('Error initializing app:', err);
    res.status(500).json({ error: 'Failed to initialize API' });
  }
};
