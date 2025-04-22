// @ts-nocheck
"use strict";

/**
 * Servidor minimalista para Heroku
 * 
 * Este é um servidor HTTP simples que pode ser usado
 * como último recurso quando todas as outras opções falham.
 */

const http = require('http');
const PORT = process.env.PORT || 5000;

// Logar variáveis de ambiente e informações do sistema
console.log('🚀 Iniciando servidor HTTP minimalista...');
console.log(`📊 PORT=${process.env.PORT}`);
console.log(`📊 NODE_ENV=${process.env.NODE_ENV}`);
console.log(`📊 NODE_VERSION=${process.version}`);
console.log(`📊 PLATAFORMA=${process.platform}`);
console.log(`📊 DIRETÓRIO=${process.cwd()}`);

// Criar servidor HTTP extremamente simples
const server = http.createServer((req, res) => {
  console.log(`Recebida requisição: ${req.method} ${req.url}`);

  // Rota de health check
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Servidor funcionando no modo minimalista'
    }));
    return;
  }

  // Rota padrão - landing page simples
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shopee Entregas</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8f9fa;
          color: #212529;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .header {
          background-color: #ee4d2d;
          color: white;
          padding: 2rem 1rem;
          text-align: center;
          margin-bottom: 2rem;
        }
        .content {
          background-color: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .alert {
          background-color: #e7f5ff;
          border-left: 4px solid #4dabf7;
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 4px;
        }
        h1 { margin-top: 0; }
        .footer {
          text-align: center;
          margin-top: 2rem;
          color: #6c757d;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Shopee Entregas</h1>
        <p>Portal do Entregador Parceiro</p>
      </div>
      <div class="container">
        <div class="content">
          <div class="alert">
            <h3>Modo de Manutenção</h3>
            <p>Estamos realizando atualizações no sistema para melhorar sua experiência. Por favor, retorne em alguns instantes.</p>
          </div>
          
          <h2>Seja um entregador parceiro</h2>
          <p>
            Na Shopee Entregas, você pode realizar entregas com total flexibilidade, escolhendo seus próprios horários e maximizando seus ganhos.
          </p>
          <p>
            Nosso sistema voltará em breve com todas as funcionalidades disponíveis para seu cadastro.
          </p>
          
          <h3>Informações do Servidor</h3>
          <ul>
            <li>Data/Hora: ${new Date().toLocaleString('pt-BR')}</li>
            <li>Node.js: ${process.version}</li>
            <li>Ambiente: ${process.env.NODE_ENV || 'development'}</li>
          </ul>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Shopee Entregas. Todos os direitos reservados.
        </div>
      </div>
    </body>
    </html>
  `);
});

// Iniciar o servidor e configurar listeners para erros
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor HTTP rodando em http://0.0.0.0:${PORT}`);
});

server.on('error', (error) => {
  console.error(`❌ ERRO AO INICIAR SERVIDOR: ${error.message}`);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso`);
  }
});

// Tratamento de sinais para encerramento limpo
process.on('SIGTERM', () => {
  console.log('🛑 Recebido sinal SIGTERM');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido sinal SIGINT');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});