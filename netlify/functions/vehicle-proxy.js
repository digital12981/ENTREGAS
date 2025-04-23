// Netlify Function para servir como proxy para a API de veículos
// Resolve problemas de CORS diretamente no Netlify

const axios = require('axios');

exports.handler = async function(event, context) {
  // Habilitar o CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };
  
  // Responder imediatamente às solicitações OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // Verificar se é uma solicitação GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  
  // Obter a placa do veículo dos parâmetros de caminho
  const path = event.path.split('/');
  const placa = path[path.length - 1];
  
  // Verificar se a placa foi fornecida
  if (!placa) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Placa do veículo é obrigatória' })
    };
  }
  
  try {
    // Fazer a chamada para a API de veículos usando axios
    const apiUrl = `https://wdapi2.com.br/consulta/${placa}`;
    
    // Obter a API key do ambiente
    const apiKey = process.env.VEHICLE_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key não configurada no ambiente' })
      };
    }
    
    // Configurar o cabeçalho de autorização (com e sem Bearer)
    let authHeader = apiKey;
    if (!apiKey.startsWith('Bearer ')) {
      authHeader = `Bearer ${apiKey}`;
    }
    
    // Fazer a chamada para a API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    // Retornar os dados da resposta
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
    
  } catch (error) {
    console.error('Erro ao consultar API de veículos:', error);
    
    // Tentar novamente sem o prefixo Bearer se houve um erro
    if (error.response && error.response.status === 401) {
      try {
        const apiUrl = `https://wdapi2.com.br/consulta/${placa}`;
        const apiKey = process.env.VEHICLE_API_KEY;
        
        // Tentar sem o prefixo Bearer
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': apiKey
          }
        });
        
        // Retornar os dados da resposta
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(response.data)
        };
      } catch (retryError) {
        console.error('Erro na segunda tentativa:', retryError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Falha ao consultar API de veículos',
            details: retryError.message || 'Erro desconhecido',
            statusCode: retryError.response ? retryError.response.status : 'N/A'
          })
        };
      }
    }
    
    // Retornar o erro da API
    return {
      statusCode: error.response ? error.response.status : 500,
      headers,
      body: JSON.stringify({
        error: 'Falha ao consultar API de veículos',
        details: error.message || 'Erro desconhecido',
        statusCode: error.response ? error.response.status : 'N/A'
      })
    };
  }
};