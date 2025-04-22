import { API_BASE_URL } from './api-config';

// Interface para os dados da solicitação de pagamento
interface PaymentRequest {
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  amount?: number;
}

// Interface para a resposta do pagamento
interface PaymentResponse {
  id: string;
  pixCode: string;
  pixQrCode: string;
  status?: string;
  error?: string;
}

/**
 * Cria uma solicitação de pagamento PIX através da API For4Payments
 * Esta função gerencia a comunicação com o backend no Heroku
 */
export async function createPixPayment(data: PaymentRequest): Promise<PaymentResponse> {
  // Em produção, use a URL completa do Heroku
  const apiUrl = import.meta.env.PROD
    ? 'https://shopee-delivery-api.herokuapp.com/api/payments/pix'
    : '/api/payments/pix';
    
  console.log(`Ambiente de execução: ${import.meta.env.PROD ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
  console.log(`URL da API de pagamentos: ${apiUrl}`);
    
  console.log(`Enviando requisição de pagamento para: ${apiUrl}`);
  console.log('Dados de pagamento:', {
    name: data.name,
    cpf: data.cpf.substring(0, 3) + '***' + data.cpf.substring(data.cpf.length - 2),
    email: data.email || 'não informado'
  });
  
  try {
    // Configurar opções de requisição para evitar problemas de CORS
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors' as RequestMode,
      credentials: 'omit' as RequestCredentials,
      body: JSON.stringify({
        name: data.name,
        cpf: data.cpf,
        email: data.email || '',
        phone: data.phone || '',
        amount: data.amount || 84.70 // Valor padrão para o kit de segurança
      })
    };
    
    // Fazer a requisição
    const response = await fetch(apiUrl, requestOptions);
    
    // Verificar se a resposta foi bem sucedida
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro HTTP ${response.status}: ${errorText}`);
      throw new Error(`Falha na comunicação com o servidor: ${response.statusText}`);
    }
    
    // Processar a resposta
    const result = await response.json();
    
    console.log('Resposta do servidor recebida com sucesso');
    
    // Validar a resposta
    if (!result.pixCode || !result.pixQrCode) {
      throw new Error('A resposta do servidor não contém os dados de pagamento PIX necessários');
    }
    
    return result;
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    throw new Error(error.message || 'Não foi possível processar o pagamento no momento');
  }
}