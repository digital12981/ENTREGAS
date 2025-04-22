import express, { type Express } from "express";
import path from "path";

/**
 * Configura middleware para melhorar a entrega de arquivos estáticos no Heroku
 */
export function setupStaticMiddleware(app: Express) {
  // Adiciona cabeçalhos CORS para permitir acesso aos assets
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Configura caminhos absolutos para assets
    if (req.url.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    
    next();
  });
}