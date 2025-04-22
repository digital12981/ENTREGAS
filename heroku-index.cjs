/**
 * Arquivo de bootstrap do Heroku
 * 
 * Este arquivo é um wrapper simples que detecta o modo de execução
 * e inicia o servidor apropriado (CommonJS ou ESM).
 * 
 * O Node.js v22+ interpreta todos os arquivos .js como ES modules quando
 * o package.json contém "type": "module". Para forçar a interpretação como 
 * CommonJS, estamos usando a extensão .cjs explícita.
 */

// Detectando se o módulo está sendo executado diretamente
const isMainModule = require.main === module;

if (isMainModule) {
  console.log('🚀 Iniciando aplicação Shopee Entregas para Heroku...');
  console.log(`📌 NODE_VERSION: ${process.version}`);
  console.log(`📌 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📌 PORT: ${process.env.PORT || 5000}`);
  
  try {
    // Carregar o servidor CommonJS principal
    console.log('✅ Iniciando servidor via heroku.cjs');
    require('./heroku.cjs');
  } catch (error) {
    console.error('❌ ERRO AO INICIAR SERVIDOR CJS:', error);
    
    try {
      // Tentar carregar o servidor de fallback
      console.log('⚠️ Tentando iniciar o servidor de fallback...');
      require('./server-fallback.js');
    } catch (fallbackError) {
      console.error('❌ ERRO NO SERVIDOR DE FALLBACK:', fallbackError);
      console.error('💥 FALHA TOTAL NA INICIALIZAÇÃO');
      
      // Manter o processo vivo para não causar reinícios em loop no Heroku
      console.log('⏳ Mantendo processo vivo para evitar reinícios em loop');
      setInterval(() => {
        console.log('💔 Servidor offline - ' + new Date().toISOString());
      }, 60000);
    }
  }
}

// Permitir importação deste módulo
module.exports = {
  version: '1.0.0',
  name: 'shopee-entregas-heroku-bootstrap'
};