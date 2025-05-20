// API route principal para Vercel
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { registerRoutes } from '../server/routes.js';

// Cria a aplicação Express
const app = express();

// Configuração básica de CORS para permitir requisições de qualquer origem
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para JSON
app.use(express.json());

// Registra as rotas
const server = await registerRoutes(app);

// Handler para requisições serverless da Vercel
export default async (req, res) => {
  // Se a requisição for para o WebSocket, será tratada pelo servidor HTTP
  if (req.url === '/api/ws') {
    return;
  }

  // Para todas as outras rotas, use o aplicativo Express
  return app(req, res);
};

// Handler para WebSocket (usado apenas no desenvolvimento local)
if (process.env.NODE_ENV !== 'production') {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  httpServer.listen(3000, () => {
    console.log('Servidor de desenvolvimento rodando na porta 3000');
  });
}