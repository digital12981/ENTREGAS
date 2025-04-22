/**
 * Script de inicialização para Heroku em CommonJS
 * 
 * Este script simples serve como ponto de entrada para a aplicação no Heroku,
 * selecionando automaticamente o método de inicialização mais apropriado:
 * - Tenta primeiro usar o modo ESM principal (heroku-server.mjs)
 * - Cai para o servidor fallback (server-fallback.js) em caso de erro
 */

try {
  console.log('🚀 Iniciando aplicação no Heroku...');
  console.log(`📌 Diretório atual: ${process.cwd()}`);
  console.log(`📌 Node.js: ${process.version}`);

  // Primeiro, verificar PORT e outras variáveis de ambiente
  const PORT = process.env.PORT || 5000;
  console.log(`📌 Porta configurada: ${PORT}`);
  console.log(`📌 NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`);

  // Tentar iniciar o servidor primário (ESM)
  try {
    console.log('Tentando iniciar o servidor principal (ESM)...');
    
    // Importar dinâmicamente o arquivo ESM
    const { spawn } = require('child_process');
    
    // Executar o script ESM em um processo separado
    const serverProcess = spawn('node', ['heroku-server.mjs'], {
      stdio: 'inherit',
      env: process.env
    });
    
    // Gerenciar eventos do processo filho
    serverProcess.on('error', (err) => {
      console.error('❌ Erro ao iniciar heroku-server.mjs:', err.message);
      console.log('⚠️ Iniciando servidor fallback...');
      require('./server-fallback.js');
    });
    
    // Se o processo falhar, iniciar o fallback
    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        console.log(`⚠️ Servidor principal encerrou com código ${code}`);
        console.log('⚠️ Iniciando servidor fallback...');
        require('./server-fallback.js');
      }
    });
  } catch (err) {
    // Em caso de falha ao iniciar o ESM, usar o servidor de fallback
    console.error('❌ Erro ao iniciar servidor ESM:', err.message);
    console.log('⚠️ Iniciando servidor fallback...');
    require('./server-fallback.js');
  }
} catch (err) {
  // Última opção: criar um servidor HTTP básico
  console.error('❌ Erro grave:', err.message);
  console.log('🔄 Iniciando servidor HTTP de emergência...');
  
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