// API Server - Apenas backend para Heroku
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Configuração
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

// Inicializar o Express
const app = express();

// Middlewares essenciais
app.use(cors({
  origin: '*', // Permitir qualquer origem em desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Mock data para exemplo
const mockRegions = [
  { name: "São Paulo", abbr: "SP", vacancies: 26 },
  { name: "Rio de Janeiro", abbr: "RJ", vacancies: 18 },
  { name: "Minas Gerais", abbr: "MG", vacancies: 14 },
  { name: "Bahia", abbr: "BA", vacancies: 10 },
  { name: "Paraná", abbr: "PR", vacancies: 8 }
];

// Middleware para log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configurar cabeçalhos CORS específicos para cada requisição
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Responder imediatamente para requisições OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Rota de verificação de saúde/status
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Rota de regiões
app.get('/api/regions', (req, res) => {
  res.json(mockRegions);
});

// Configuração para pagamentos (rota de exemplo)
app.post('/api/payments/create-pix', (req, res) => {
  const { name, cpf, email, amount } = req.body;
  
  // Verificação básica de dados
  if (!name || !cpf || !amount) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  
  // Gerar ID único para o pagamento
  const paymentId = `pix_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Simulação de uma resposta da API de pagamento
  const pixResponse = {
    id: paymentId,
    pixCode: `00020126580014BR.GOV.BCB.PIX0136${cpf}5204000053039865802BR5913Shopee${name}6009SAO PAULO62070503***6304${Math.floor(Math.random() * 10000)}`,
    pixQrCode: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(`pixcode-for-${cpf}`)}`,
    status: 'pending'
  };
  
  res.json(pixResponse);
});

// Middleware para tratar rotas não encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Para qualquer outra rota, responder com informações sobre a API
app.use('*', (req, res) => {
  res.json({
    name: 'Shopee Delivery Partners API',
    version: '1.0.0',
    endpoints: [
      { path: '/api/regions', method: 'GET', description: 'Lista de regiões com vagas disponíveis' },
      { path: '/api/payments/create-pix', method: 'POST', description: 'Cria um pagamento PIX' },
      { path: '/health', method: 'GET', description: 'Verificação de status da API' }
    ]
  });
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS: Permitindo todas as origens`);
});