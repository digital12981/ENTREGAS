import axios from 'axios';

// Interface para o payload de pagamento
interface For4PaymentsData {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
}

/**
 * Wrapper para chamar a API Flask for4payments
 */
export async function createFor4Payment(data: For4PaymentsData) {
  try {
    console.log('Processando pagamento via API For4Payments:', data);
    
    // Definir a URL do serviço Flask (prod vs dev)
    let apiUrl = process.env.FOR4PAYMENTS_API_URL || 'https://shopee-entregas.com/api/for4payments';
    
    // Em desenvolvimento, use localhost
    if (process.env.NODE_ENV === 'development') {
      apiUrl = 'http://localhost:5000/api/for4payments';
    }
    
    console.log(`FOR4PAYMENTS_API_URL: ${process.env.FOR4PAYMENTS_API_URL || 'não definido'}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`);
    
    console.log(`Enviando solicitação para: ${apiUrl}`);
    
    // Chamar a API Flask via HTTP
    const response = await axios.post(apiUrl, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('Resultado da API For4Payments:', response.status);
    
    // Retornar os dados
    return response.data;
  } catch (error: any) {
    console.error('Erro ao processar pagamento via API For4Payments:', error.message);
    
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    
    throw new Error(`Falha ao processar pagamento: ${error.message}`);
  }
}