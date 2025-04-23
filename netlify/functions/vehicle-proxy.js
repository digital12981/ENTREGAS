// Netlify Function para servir como proxy para a API de veículos
// Resolve problemas de CORS diretamente no Netlify
// Atualizado para resolver erros 401/403 e falhas de CORS

// Importar o módulo node-fetch (versão 2.x é compatível com require)
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Configurar headers CORS (permitir qualquer origem)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Responder imediatamente às solicitações OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    console.log('Recebida requisição OPTIONS - respondendo preflight CORS');
    return {
      statusCode: 204, // No Content
      headers,
      body: ''
    };
  }
  
  // Verificar se é uma solicitação GET
  if (event.httpMethod !== 'GET') {
    console.log(`Método não permitido: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed', message: 'Apenas o método GET é suportado' })
    };
  }
  
  // Extrair a placa do caminho da URL
  let placa = '';
  
  // Tentar diferentes formatos do path
  if (event.path.includes('/vehicle-proxy/')) {
    placa = event.path.split('/vehicle-proxy/')[1];
  } else if (event.path.includes('/vehicle-api/')) {
    placa = event.path.split('/vehicle-api/')[1];
  } else {
    // Último recurso: pegar o último segmento do path
    const pathSegments = event.path.split('/');
    placa = pathSegments[pathSegments.length - 1];
  }
  
  // Limpar a placa (remover qualquer caractere especial)
  placa = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  console.log(`Processando consulta para placa: ${placa}`);
  
  // Verificar se a placa tem pelo menos 7 caracteres
  if (!placa || placa.length < 7) {
    console.log('Placa inválida ou muito curta:', placa);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Placa inválida',
        message: 'A placa do veículo deve ter pelo menos 7 caracteres'
      })
    };
  }
  
  // Obter a API key do ambiente
  const apiKey = process.env.VEHICLE_API_KEY;
  
  if (!apiKey) {
    console.error('API key não configurada nas variáveis de ambiente');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Configuração incorreta', 
        message: 'API key não configurada no ambiente Netlify'
      })
    };
  }
  
  console.log(`API key disponível: ${apiKey ? 'Sim' : 'Não'} (${apiKey.substring(0, 10)}...)`);
  
  // URL da API
  const apiUrl = `https://wdapi2.com.br/consulta/${placa}`;
  
  // Tentativa 1: Com Bearer
  let vehicleData = null;
  let errorDetails = null;
  
  try {
    console.log('Tentativa 1: Consultando API com Bearer token');
    
    const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const status = response.status;
      console.warn(`Tentativa 1 falhou: status ${status}`);
      
      if (status === 401 || status === 403) {
        throw new Error(`API rejeitou autenticação: ${status}`);
      } else {
        throw new Error(`API retornou status: ${status}`);
      }
    }
    
    vehicleData = await response.json();
    console.log('Tentativa 1 bem-sucedida - Dados obtidos da API');
    
  } catch (error) {
    console.error('Erro na Tentativa 1:', error.message);
    errorDetails = {
      message: error.message,
      attempt: 1
    };
    
    // Tentativa 2: Sem Bearer
    if (!apiKey.startsWith('Bearer ')) {
      try {
        console.log('Tentativa 2: Consultando API sem Bearer token');
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': apiKey,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          const status = response.status;
          console.warn(`Tentativa 2 falhou: status ${status}`);
          throw new Error(`API retornou status: ${status}`);
        }
        
        vehicleData = await response.json();
        console.log('Tentativa 2 bem-sucedida - Dados obtidos da API');
        
      } catch (retryError) {
        console.error('Erro na Tentativa 2:', retryError.message);
        errorDetails.retry = {
          message: retryError.message,
          attempt: 2
        };
      }
    }
  }
  
  // Verificar resultado e retornar
  if (vehicleData) {
    // Formatar os dados para o cliente
    const formattedData = {
      marca: vehicleData.MARCA || "Não informado",
      modelo: vehicleData.MODELO || "Não informado",
      ano: vehicleData.ano || "Não informado",
      anoModelo: vehicleData.anoModelo || "Não informado",
      chassi: vehicleData.chassi || "Não informado",
      cor: vehicleData.cor || "Não informado",
      
      // Preservar dados originais
      original: vehicleData
    };
    
    console.log('Retornando dados do veículo:', formattedData.marca, formattedData.modelo);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedData)
    };
  }
  
  // Nenhuma tentativa teve sucesso, retornar erro
  console.error('Todas as tentativas falharam');
  
  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({
      error: 'Falha ao consultar dados do veículo',
      placa: placa,
      details: errorDetails || 'Erro desconhecido',
      timestamp: new Date().toISOString()
    })
  };
};