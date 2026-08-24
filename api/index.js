require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { AppModule } = require('../backend/dist/app.module');

let app = null;

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

module.exports = async (req, res) => {
  try {
    const expressApp = await initApp();
    return expressApp(req, res);
  } catch (err) {
    console.error('Error initializing app:', err);
    res.status(500).json({ error: 'Failed to initialize API', details: err.message });
  }
};
