/**
 * Servidor Express simplificado para Heroku
 * 
 * Implementação minimalista para servir arquivos estáticos e APIs REST
 * sem dependências de propriedades não padrão como import.meta.dirname
 */
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { createServer } from 'http';
import fs from 'fs';

// Obter diretório atual de forma compatível com ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar APIs necessárias
import { pool, db } from './dist/server/db.js';
import { storage } from './dist/server/storage.js';
import { paymentService } from './dist/server/payment.js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Configurar headers para UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Logging de tempo de resposta para APIs
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// ========================
// Configurar rotas da API
// ========================
async function setupApiRoutes() {
  // API de regiões
  app.get('/api/regions', async (req, res) => {
    try {
      const regions = await storage.getStatesWithVacancies();
      res.json(regions);
    } catch (error) {
      console.error('Erro ao buscar regiões:', error);
      res.status(500).json({ message: 'Erro ao buscar regiões' });
    }
  });

  // API de benefícios
  app.get('/api/benefits', async (req, res) => {
    try {
      const benefits = await storage.getAllBenefits();
      res.json(benefits);
    } catch (error) {
      console.error('Erro ao buscar benefícios:', error);
      res.status(500).json({ message: 'Erro ao buscar benefícios' });
    }
  });

  // API de pagamentos
  app.post('/api/payments', async (req, res) => {
    try {
      const { name, email, cpf, phone, amount } = req.body;
      
      if (!name || !email || !cpf || !amount) {
        return res.status(400).json({ 
          message: 'Dados incompletos. Todos os campos são obrigatórios.' 
        });
      }

      const payment = await paymentService.createPixPayment({
        name, email, cpf, phone, amount
      });

      res.json(payment);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      res.status(500).json({ 
        message: 'Erro ao processar pagamento. Tente novamente mais tarde.',
        error: error.message 
      });
    }
  });

  return createServer(app);
}

// ========================
// Servir arquivos estáticos
// ========================
function serveStaticFiles() {
  // Caminho para a pasta de arquivos compilados (frontend)
  const publicDir = join(__dirname, 'dist', 'public');
  
  if (!fs.existsSync(publicDir)) {
    console.warn(`⚠️ Diretório de arquivos estáticos não encontrado: ${publicDir}`);
    
    // Criar uma página temporária caso os arquivos estáticos não existam
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return; // Skip para APIs
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Shopee Entregador</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
            .message { background: #ffffd0; border-left: 4px solid #ffcc00; padding: 1rem; }
          </style>
        </head>
        <body>
          <h1>Shopee Entregador</h1>
          <div class="message">
            <p>Aplicação em manutenção. Por favor, volte em alguns instantes.</p>
          </div>
        </body>
        </html>
      `);
    });
    
    return;
  }
  
  // Servir arquivos estáticos
  app.use(express.static(publicDir));
  
  // Fallback para index.html (SPA routing)
  app.get('*', (req, res) => {
    // Skip para APIs
    if (req.path.startsWith('/api')) return;
    
    const indexPath = join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Página não encontrada');
    }
  });
}

// ========================
// Iniciar o servidor
// ========================
async function startServer() {
  try {
    console.log('Iniciando servidor...');
    
    // Configurar rotas da API
    const server = await setupApiRoutes();
    
    // Configurar middleware para servir arquivos estáticos
    serveStaticFiles();
    
    // Middleware para tratamento de erros
    app.use((err, _req, res, _next) => {
      console.error('Erro na aplicação:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Erro interno do servidor";
      res.status(status).json({ message });
    });

    // Iniciar servidor na porta fornecida pelo Heroku
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
}

// Iniciar o servidor
startServer();