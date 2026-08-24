module.exports = async (req, res) => {
  console.log('API called:', req.url);
  try {
    require('reflect-metadata');
    const { NestFactory } = require('@nestjs/core');
    const { ExpressAdapter } = require('@nestjs/platform-express');
    const express = require('express');
    
    // Import the compiled backend module
    const appModule = require('../backend/dist/app.module').AppModule;
    
    const expressApp = express();
    const nestApp = await NestFactory.create(
      appModule,
      new ExpressAdapter(expressApp)
    );
    nestApp.enableCors({ 
      origin: ['http://localhost:5173', /\.vercel\.app$/]
    });
    await nestApp.init();
    
    console.log('NestJS app initialized successfully');
    
    // Forward the request to the NestJS app
    return expressApp(req, res);
  } catch (err) {
    console.error('Error in API handler:', err);
    res.status(500).json({ 
      error: 'Failed to initialize API',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
