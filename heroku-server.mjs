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
    console.log('Diretórios disponíveis:');
    
    // Listar diretórios disponíveis para debug
    try {
      const distDir = join(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        console.log(`Conteúdo de ${distDir}:`);
        const distContent = fs.readdirSync(distDir);
        console.log(distContent);
        
        // Verificar pasta assets
        const assetsDir = join(distDir, 'public', 'assets');
        if (fs.existsSync(assetsDir)) {
          console.log(`Conteúdo de ${assetsDir}:`);
          const assetsContent = fs.readdirSync(assetsDir);
          console.log(assetsContent);
        }
      }
    } catch (e) {
      console.error('Erro ao listar diretórios:', e);
    }
    
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
  
  // Verificar a estrutura real dos diretórios após o build
  const directoryStructure = {};
  
  // Investigar a estrutura de dist
  const distDir = join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    directoryStructure.dist = fs.readdirSync(distDir);
    
    // Verificar se existe a pasta 'assets' diretamente em dist
    const distAssets = join(distDir, 'assets');
    if (fs.existsSync(distAssets)) {
      directoryStructure.distAssets = fs.readdirSync(distAssets);
    }
    
    // Verificar se existe a pasta 'public' em dist
    const distPublic = join(distDir, 'public');
    if (fs.existsSync(distPublic)) {
      directoryStructure.distPublic = fs.readdirSync(distPublic);
      
      // Verificar se existe a pasta 'assets' dentro de public
      const publicAssets = join(distPublic, 'assets');
      if (fs.existsSync(publicAssets)) {
        directoryStructure.publicAssets = fs.readdirSync(publicAssets);
      }
    }
  }
  
  console.log('Estrutura de diretórios encontrada:');
  console.log(JSON.stringify(directoryStructure, null, 2));
  
  // Servir arquivos estáticos considerando todas as possíveis estruturas
  
  // 1. Primeiro, tentar servir de dist/public se existir
  if (fs.existsSync(publicDir)) {
    console.log(`Servindo arquivos estáticos de: ${publicDir}`);
    app.use(express.static(publicDir));
  }
  
  // 2. Servir também diretamente de dist/ como fallback
  console.log(`Servindo arquivos estáticos também de: ${distDir}`);
  app.use(express.static(distDir));
  
  // 3. Rota específica para assets que lida com diferentes formatos de URL
  app.get(['/assets/*', '*/assets/*'], (req, res, next) => {
    console.log(`Requisição para asset: ${req.path}`);
    
    // Remover qualquer prefixo do caminho e extrair o nome do arquivo
    const assetPath = req.path.replace(/^.*assets\//, '');
    
    // Listar todos os caminhos possíveis para o arquivo
    const possiblePaths = [
      join(distDir, 'assets', assetPath),
      join(publicDir, 'assets', assetPath),
      join(distDir, 'public', 'assets', assetPath),
      // Adicionar suporte para subdiretórios
      ...directoryStructure.distAssets?.map(subdir => 
        join(distDir, 'assets', subdir, assetPath)) || [],
      ...directoryStructure.publicAssets?.map(subdir => 
        join(publicDir, 'assets', subdir, assetPath)) || []
    ];
    
    // Verificar cada caminho e enviar o primeiro arquivo encontrado
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        console.log(`Asset encontrado em: ${path}`);
        return res.sendFile(path);
      }
    }
    
    console.log(`⚠️ Asset não encontrado: ${assetPath}`);
    next();
  });
  
  // 4. Rota específica para lidar com requisições diretas de JS e CSS
  app.get(['*.js', '*.css'], (req, res, next) => {
    const filename = req.path.split('/').pop();
    console.log(`Requisição para arquivo ${filename}`);
    
    // Procurar o arquivo em diretórios dist e seus subdiretórios
    const possibleLocations = [
      join(distDir, filename),
      join(publicDir, filename),
      join(distDir, 'assets', filename),
      join(publicDir, 'assets', filename)
    ];
    
    for (const location of possibleLocations) {
      if (fs.existsSync(location)) {
        console.log(`Arquivo encontrado em: ${location}`);
        return res.sendFile(location);
      }
    }
    
    next();
  });
  
  // Rota para index.html (SPA routing)
  app.get('*', (req, res) => {
    // Skip para APIs
    if (req.path.startsWith('/api')) return;
    
    const indexPath = join(publicDir, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      console.log(`Servindo página principal de: ${indexPath}`);
      res.sendFile(indexPath);
    } else {
      console.log(`Não foi possível encontrar index.html em ${indexPath}`);
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