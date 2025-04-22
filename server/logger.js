/**
 * Módulo de logging para ambiente de produção
 */

// Registrar timestamps em UTC para facilitar a depuração
function getTimestamp() {
  return new Date().toISOString();
}

// Níveis de log com cores para ambiente de desenvolvimento
const LogLevel = {
  DEBUG: { name: 'DEBUG', color: '\x1b[34m' }, // azul
  INFO: { name: 'INFO', color: '\x1b[32m' },  // verde
  WARN: { name: 'WARN', color: '\x1b[33m' },  // amarelo
  ERROR: { name: 'ERROR', color: '\x1b[31m' }, // vermelho
  FATAL: { name: 'FATAL', color: '\x1b[35m' }  // roxo
};

// Função de formatação de log
function formatLog(level, message, context = {}) {
  const timestamp = getTimestamp();
  const logObject = {
    timestamp,
    level: level.name,
    message,
    ...context
  };

  // Formatação diferente para desenvolvimento e produção
  if (process.env.NODE_ENV === 'development') {
    const reset = '\x1b[0m';
    const formattedMessage = `${timestamp} [${level.color}${level.name}${reset}] ${message}`;
    
    // Adicionar contexto se existir
    const contextStr = Object.keys(context).length 
      ? `\n${JSON.stringify(context, null, 2)}`
      : '';
      
    return formattedMessage + contextStr;
  } else {
    // Em produção, retornar JSON para facilitar análise de logs
    return JSON.stringify(logObject);
  }
}

// Funções de logging
const logger = {
  debug: (message, context = {}) => {
    console.log(formatLog(LogLevel.DEBUG, message, context));
  },
  
  info: (message, context = {}) => {
    console.log(formatLog(LogLevel.INFO, message, context));
  },
  
  warn: (message, context = {}) => {
    console.warn(formatLog(LogLevel.WARN, message, context));
  },
  
  error: (message, error, context = {}) => {
    const errorContext = { ...context };
    
    // Adicionar detalhes de erro se disponíveis
    if (error instanceof Error) {
      errorContext.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }
    
    console.error(formatLog(LogLevel.ERROR, message, errorContext));
  },
  
  fatal: (message, error, context = {}) => {
    const errorContext = { ...context };
    
    // Adicionar detalhes de erro se disponíveis
    if (error instanceof Error) {
      errorContext.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }
    
    console.error(formatLog(LogLevel.FATAL, message, errorContext));
  }
};

// Exportar o logger
module.exports = logger;