
/**
 * Heroku startup script for Node.js ESM application
 * 
 * Este script inicia o servidor Express para o ambiente de produção Heroku
 */
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

// Importações dinâmicas para garantir compatibilidade
let registerRoutes;
let serveStatic;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

const startServer = async () => {
  try {
    console.log('Inicializando servidor...');
    
    // Carregar módulos dinamicamente
    try {
      console.log('Carregando módulos do servidor...');
      
      // Tentar primeiro importar dos caminhos esperados na pasta dist/server
      try {
        const routes = await import('./dist/server/routes.js');
        registerRoutes = routes.registerRoutes;
        console.log('✅ Módulo routes.js carregado com sucesso');
        
        const vite = await import('./dist/server/vite.js');
        serveStatic = vite.serveStatic;
        console.log('✅ Módulo vite.js carregado com sucesso');
      } catch (e) {
        console.error('Erro ao carregar módulos da pasta dist/server:', e);
        console.log('Tentando caminho alternativo...');
        
        // Fallback: tentar carregar diretamente do arquivo index.js
        const mainModule = await import('./dist/index.js');
        registerRoutes = mainModule.registerRoutes || mainModule.default?.registerRoutes;
        serveStatic = mainModule.serveStatic || mainModule.default?.serveStatic;
        
        if (!registerRoutes || !serveStatic) {
          throw new Error('Não foi possível encontrar as funções necessárias nos módulos carregados');
        }
        
        console.log('✅ Módulos carregados do arquivo index.js');
      }
    } catch (loadError) {
      console.error('Falha ao carregar módulos necessários:', loadError);
      
      // Implementação de fallback básica para servir uma página estática
      app.get('*', (req, res) => {
        res.status(500).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Erro de Inicialização</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
              .error { background: #fff0f0; border-left: 4px solid #ff3333; padding: 1rem; }
            </style>
          </head>
          <body>
            <h1>Erro na Inicialização do Servidor</h1>
            <p>Ocorreu um erro ao inicializar o servidor. Por favor, tente novamente mais tarde.</p>
            <div class="error">
              <pre>${loadError.stack || loadError.message}</pre>
            </div>
          </body>
          </html>
        `);
      });
      
      // Criar servidor HTTP básico
      const server = createServer(app);
      const PORT = process.env.PORT || 5000;
      server.listen(PORT, "0.0.0.0", () => {
        console.log(`⚠️ Servidor de fallback rodando na porta ${PORT}`);
      });
      
      return; // Encerrar a função aqui para evitar a execução do código abaixo
    }
    
    // Iniciar o servidor com os módulos carregados
    const server = await registerRoutes(app);
    
    // Adicionar middleware de tratamento de erros
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(`Error: ${err.message || 'Unknown error'}`);
      res.status(status).json({ message });
    });

    // Configurar arquivos estáticos para produção
    serveStatic(app);

    // Usar a porta fornecida pelo Heroku
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
    });

    // Tratar desligamento gracioso
    process.on('SIGTERM', () => {
      console.log('Sinal SIGTERM recebido: fechando servidor HTTP');
      server.close(() => {
        console.log('Servidor HTTP fechado');
      });
    });
  } catch (error) {
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
