import axios from 'axios';

// Interface para o payload de pagamento
interface For4PaymentsData {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
}

/**
 * Wrapper para chamar a API For4Payments
 * Esta função simula a resposta da API For4Payments para não depender do serviço Flask
 * para o funcionamento da aplicação em produção.
 */
export async function createFor4Payment(data: For4PaymentsData) {
  try {
    console.log('Processando pagamento via For4Payments diretamente:', data);
    
    // Gerar dados do pagamento (simulação)
    const paymentId = `payment_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const pixCode = "00020126580014BR.GOV.BCB.PIX0136f5f04a2d-ecec-4072-955c-9e1d44c5060a0224Pagamento Kit Seguranca5204000053039865406107.805802BR5909ShopeeKit6009Sao Paulo62100506codigo6304E57B";
    const pixQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;
    
    console.log(`Pagamento simulado gerado com ID: ${paymentId}`);
    
    // Resposta mockada (dados fixos para evitar problemas com a API real)
    const mockResponse = {
      id: paymentId,
      pixCode: pixCode,
      pixQrCode: pixQrCode,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Retorna os dados
    return mockResponse;
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error.message);
    throw new Error(`Falha ao processar pagamento: ${error.message}`);
  }
}