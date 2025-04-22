/**
 * Script de inicialização para Heroku em CommonJS
 * 
 * Este script simples serve como ponto de entrada para a aplicação no Heroku,
 * selecionando automaticamente o método de inicialização mais apropriado.
 * 
 * Estratégia de inicialização:
 * 1. Em produção, vai direto para o servidor de fallback (modo contingência)
 * 2. Em outros ambientes, tenta inicializar o ESM primeiro
 * 3. Se falhar, cai para o fallback CommonJS
 */

try {
  console.log('🚀 Iniciando aplicação no Heroku...');
  console.log(`📌 Diretório atual: ${process.cwd()}`);
  console.log(`📌 Node.js: ${process.version}`);

  // Verificar variáveis de ambiente
  const PORT = process.env.PORT || 5000;
  const NODE_ENV = process.env.NODE_ENV || 'não definido';
  console.log(`📌 Porta configurada: ${PORT}`);
  console.log(`📌 NODE_ENV: ${NODE_ENV}`);

  // Em produção, ir direto para o fallback para maximizar disponibilidade
  if (NODE_ENV === 'production') {
    console.log('✅ Ambiente de produção detectado. Iniciando no modo contingência...');
    require('./server-fallback.js');
  } else {
    // Em outros ambientes, tentar modo ESM primeiro
    try {
      console.log('🔄 Tentando iniciar o servidor principal (ESM)...');
      
      // Importar e configurar módulos necesssários
      const fs = require('fs');
      const path = require('path');
      const { spawn } = require('child_process');
      
      // Verificar se temos o arquivo ESM
      const esmFile = path.join(process.cwd(), 'heroku-server.mjs');
      const fallbackFile = path.join(process.cwd(), 'server-fallback.js');
      
      if (!fs.existsSync(esmFile)) {
        console.warn(`⚠️ Arquivo ESM não encontrado: ${esmFile}`);
        console.log('⚠️ Iniciando servidor fallback diretamente...');
        require('./server-fallback.js');
        process.exit(0); // Usar process.exit em vez de return
      }
      
      // Verificar se temos o arquivo de fallback para caso de erro
      if (!fs.existsSync(fallbackFile)) {
        console.warn(`⚠️ Arquivo de fallback não encontrado: ${fallbackFile}`);
      }
      
      console.log('✅ Arquivos verificados, iniciando servidor principal...');
      
      // Executar o script ESM em um processo separado
      const serverProcess = spawn('node', ['heroku-server.mjs'], {
        stdio: 'inherit',
        env: process.env
      });
      
      // Configurar temporizador para esperar a inicialização
      let serverStarted = false;
      const fallbackTimer = setTimeout(() => {
        if (!serverStarted) {
          console.warn('⚠️ Timeout ao esperar servidor principal iniciar');
          console.log('⚠️ Iniciando servidor fallback...');
          try {
            require('./server-fallback.js');
          } catch (fallbackError) {
            console.error('❌ Erro crítico ao iniciar servidor fallback:', fallbackError);
            initEmergencyServer();
          }
        }
      }, 10000); // 10 segundos de timeout
      
      // Gerenciar eventos do processo filho
      serverProcess.on('error', (err) => {
        clearTimeout(fallbackTimer);
        console.error('❌ Erro ao iniciar heroku-server.mjs:', err.message);
        console.log('⚠️ Iniciando servidor fallback...');
        try {
          require('./server-fallback.js');
        } catch (fallbackError) {
          console.error('❌ Erro crítico ao iniciar servidor fallback:', fallbackError);
          initEmergencyServer();
        }
      });
      
      // Se o processo falhar, iniciar o fallback
      serverProcess.on('exit', (code) => {
        clearTimeout(fallbackTimer);
        if (code !== 0) {
          console.log(`⚠️ Servidor principal encerrou com código ${code}`);
          console.log('⚠️ Iniciando servidor fallback...');
          try {
            require('./server-fallback.js');
          } catch (fallbackError) {
            console.error('❌ Erro crítico ao iniciar servidor fallback:', fallbackError);
            initEmergencyServer();
          }
        } else {
          console.log('✅ Servidor principal encerrou normalmente');
          serverStarted = true;
        }
      });
    } catch (err) {
      // Em caso de falha ao iniciar o ESM, usar o servidor de fallback
      console.error('❌ Erro ao iniciar servidor ESM:', err.message);
      console.log('⚠️ Iniciando servidor fallback...');
      try {
        require('./server-fallback.js');
      } catch (fallbackError) {
        console.error('❌ Erro crítico ao iniciar servidor fallback:', fallbackError);
        initEmergencyServer();
      }
    }
  }
} catch (err) {
  // Erro crítico na inicialização
  console.error('❌ Erro grave:', err.message);
  initEmergencyServer();
}

// Função para servidor de emergência absoluta
function initEmergencyServer() {
  console.log('🔥 Iniciando servidor HTTP de emergência...');
  
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
            <li>Servidor: Modo de emergência</li>
            <li>Node.js: ${process.version}</li>
            <li>Hora: ${new Date().toISOString()}</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  });
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 Servidor de emergência rodando na porta ${PORT}`);
  });
}