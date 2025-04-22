// @ts-nocheck
"use strict";

/**
 * Ponto de entrada simples para Heroku
 * Este arquivo serve como um gateway simples que
 * carrega o servidor minimalista.
 */

try {
  console.log('🚀 Iniciando aplicação para Heroku...');
  console.log(`📌 NODE_VERSION: ${process.version}`);
  console.log(`📌 PORT: ${process.env.PORT}`);
  console.log(`📌 NODE_ENV: ${process.env.NODE_ENV}`);

  // Carregar o servidor minimalista diretamente
  require('./server-minimal.js');
} catch (error) {
  console.error('❌ Erro crítico ao iniciar o servidor:', error);
  
  // Em caso de erro ao carregar o servidor, iniciar um servidor de emergência
  const http = require('http');
  const PORT = process.env.PORT || 5000;
  
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Shopee Entregas - Modo de Emergência</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
          .alert { background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }
          .info { background: #d1ecf1; color: #0c5460; padding: 1rem; border-radius: 4px; }
          h1 { color: #ee4d2d; }
        </style>
      </head>
      <body>
        <h1>Shopee Entregas</h1>
        <div class="alert">
          <h2>Servidor em Manutenção</h2>
          <p>Estamos realizando manutenção no servidor. Por favor, tente novamente em alguns instantes.</p>
        </div>
        <div class="info">
          <h3>Informações:</h3>
          <ul>
            <li>Servidor: Modo de emergência absoluta</li>
            <li>Node.js: ${process.version}</li>
            <li>Hora: ${new Date().toISOString()}</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  });
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 Servidor de emergência absoluta rodando na porta ${PORT}`);
  });
}