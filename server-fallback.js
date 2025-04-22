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
  }
}

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
  
  // Resposta básica se não encontrar index.html
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shopee Entregas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        header {
          background-color: #ee4d2d;
          color: white;
          padding: 1rem;
          text-align: center;
        }
        main {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
        }
        h1 { margin-top: 0; }
        h2 { color: #ee4d2d; }
      </style>
    </head>
    <body>
      <header>
        <h1>Shopee Entregas</h1>
      </header>
      <main>
        <div class="card">
          <h2>Seja um entregador parceiro</h2>
          <p>Receba pedidos e entregue com independência e flexibilidade.</p>
          <p>Entre em contato para mais informações.</p>
        </div>
        <div class="card">
          <h2>Benefícios</h2>
          <ul>
            <li>Horário flexível</li>
            <li>Ganhos semanais</li>
            <li>Suporte ao entregador</li>
            <li>Oportunidades em diversas regiões</li>
          </ul>
        </div>
      </main>
    </body>
    </html>
  `);
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor Express de fallback rodando na porta ${PORT}`);
});