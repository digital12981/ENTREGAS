/**
 * Cliente direto para a For4Payments API
 * Para uso quando o secret está disponível como variável de ambiente na Netlify
 */

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

// Gerar email aleatório para casos onde o email não é fornecido
function generateRandomEmail(name: string): string {
  const username = name.toLowerCase().replace(/\s+/g, '.').substring(0, 15);
  const randomString = Math.random().toString(36).substring(2, 10);
  return `${username}.${randomString}@mail.shopee.br`;
}

// Gerar telefone aleatório para casos onde o telefone não é fornecido
function generateRandomPhone(): string {
  const ddd = Math.floor(Math.random() * (99 - 11) + 11);
  const numero1 = Math.floor(Math.random() * (99999 - 10000) + 10000);
  const numero2 = Math.floor(Math.random() * (9999 - 1000) + 1000);
  return `${ddd}${numero1}${numero2}`;
}

/**
 * Cria um pagamento PIX diretamente pelo frontend usando a API For4Payments
 * 
 * ATENÇÃO: Isto deve ser usado apenas quando FOR4PAYMENTS_SECRET_KEY está 
 * configurada no ambiente Netlify como variável segura.
 */
export async function createPixPaymentDirect(data: PaymentRequest): Promise<PaymentResponse> {
  // Obter SECRET_KEY da variável de ambiente definida na Netlify
  const secretKey = import.meta.env.VITE_FOR4PAYMENTS_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('VITE_FOR4PAYMENTS_SECRET_KEY não configurada no ambiente. Configure nas Environment Variables da Netlify.');
  }
  
  // URL da API For4Payments
  const apiUrl = 'https://app.for4payments.com.br/api/v1/pix/create';
  
  console.log(`Criando pagamento PIX diretamente via For4Payments`);
  
  try {
    // Montar o payload da requisição
    const payload = {
      name: data.name,
      document: data.cpf.replace(/[^0-9]/g, ''), // Remover caracteres não numéricos
      email: data.email || generateRandomEmail(data.name),
      phone: data.phone || generateRandomPhone(),
      amount: data.amount || 84.70, // Valor padrão para o kit de segurança
      description: "Kit de Segurança Shopee Delivery"
    };
    
    console.log('Enviando requisição para For4Payments:', {
      ...payload,
      document: payload.document.substring(0, 3) + '***' + payload.document.substring(payload.document.length - 2),
    });
    
    // Configurar e enviar a requisição para a For4Payments API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(payload)
    });
    
    // Verificar se a resposta foi bem sucedida
    if (!response.ok) {
      throw new Error(`Falha na comunicação com For4Payments: ${response.statusText}`);
    }
    
    // Processar a resposta
    const result = await response.json();
    console.log('Resposta da For4Payments recebida:', result);
    
    // Validar a resposta
    if (!result.pixCode || !result.pixQrCode) {
      throw new Error('Resposta da For4Payments incompleta');
    }
    
    return {
      id: result.id || result.pixId || '',
      pixCode: result.pixCode,
      pixQrCode: result.pixQrCode
    };
  } catch (error: any) {
    console.error('Erro ao processar pagamento direto:', error);
    // Propagar o erro para que o caller possa tentar com o Heroku
    throw new Error(error.message || 'Não foi possível processar o pagamento no momento');
  }
}