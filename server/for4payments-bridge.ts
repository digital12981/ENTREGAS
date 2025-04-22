// Importar bibliotecas
// Usamos o comentário "prettier-ignore" para evitar formatação automática
// @ts-ignore
import axios from 'axios';

// Interface para o payload de pagamento
interface For4PaymentsData {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
}

// Versão modificada para ser compatível com o Heroku e Node.js 22
// Removidas dependências externas desnecessárias
export async function createFor4Payment(data: For4PaymentsData) {
  try {
    console.log('Processando pagamento via For4Payments diretamente:', data);
    console.log('NODE VERSION:', process.version);
    
    // Gerar dados do pagamento (simulação)
    const paymentId = `payment_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const pixCode = "00020126580014BR.GOV.BCB.PIX0136f5f04a2d-ecec-4072-955c-9e1d44c5060a0224Pagamento Kit Seguranca5204000053039865406107.805802BR5909ShopeeKit6009Sao Paulo62100506codigo6304E57B";
    
    // Gerar URL do QR code que funciona em qualquer ambiente
    const pixQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;
    
    console.log(`Pagamento simulado gerado com ID: ${paymentId}`);
    
    // Resposta padronizada
    return {
      id: paymentId,
      pixCode: pixCode,
      pixQrCode: pixQrCode,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error.message);
    
    // Retornar erro padronizado para facilitar debug
    throw new Error(`Falha ao processar pagamento: ${error.message || 'Erro desconhecido'}`);
  }
}