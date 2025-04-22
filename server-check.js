/**
 * Script para verificar a configuração do servidor e diagnosticar problemas
 * 
 * Uso: node server-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função helper para log estilizado
function logHeader(message) {
  console.log('\n\x1b[1m\x1b[36m' + message + '\x1b[0m');
  console.log('-'.repeat(message.length));
}

function logError(message) {
  console.error('\x1b[31m✖ ' + message + '\x1b[0m');
}

function logSuccess(message) {
  console.log('\x1b[32m✓ ' + message + '\x1b[0m');
}

function logWarning(message) {
  console.log('\x1b[33m⚠ ' + message + '\x1b[0m');
}

function logInfo(message) {
  console.log('\x1b[36mi ' + message + '\x1b[0m');
}

// Iniciar verificação
logHeader('VERIFICAÇÃO DE SERVIDOR');
console.log('Timestamp: ' + new Date().toISOString());

// 1. Verificar Node.js e ambiente
logHeader('AMBIENTE');
console.log('Node version: ' + process.version);
console.log('Environment: ' + (process.env.NODE_ENV || 'não definido'));
console.log('Current directory: ' + process.cwd());

// 2. Verificar variáveis de ambiente críticas
logHeader('VARIÁVEIS DE AMBIENTE');
const requiredEnvVars = ['DATABASE_URL', 'FOR4PAYMENTS_SECRET_KEY'];
const optionalEnvVars = ['PORT', 'FOR4PAYMENTS_API_URL'];

let envErrors = 0;
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    logError(`${varName} não está definida (obrigatória)`);
    envErrors++;
  } else {
    logSuccess(`${varName} está configurada`);
  }
});

optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    logWarning(`${varName} não está definida (opcional)`);
  } else {
    logInfo(`${varName} está configurada`);
  }
});

if (envErrors > 0) {
  logError(`Encontradas ${envErrors} variáveis de ambiente obrigatórias ausentes.`);
} else {
  logSuccess('Todas as variáveis de ambiente obrigatórias estão configuradas.');
}

// 3. Verificar estrutura de diretórios
logHeader('ESTRUTURA DE ARQUIVOS');
const criticalPaths = [
  { path: 'dist', description: 'Diretório de build (dist)' },
  { path: 'dist/index.js', description: 'Arquivo principal do servidor (dist/index.js)' },
  { path: 'public', description: 'Diretório de arquivos estáticos (public)' },
  { path: 'public/index.html', description: 'Arquivo HTML principal (public/index.html)' },
];

let fileErrors = 0;
criticalPaths.forEach(({ path: filePath, description }) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    logError(`${description} não encontrado: ${filePath}`);
    fileErrors++;
  } else {
    logSuccess(`${description} encontrado`);
  }
});

// 4. Verificar conteúdo do public
logHeader('ARQUIVOS ESTÁTICOS');
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  try {
    const files = fs.readdirSync(publicDir);
    if (files.length === 0) {
      logError('Diretório public está vazio');
    } else {
      logSuccess(`Diretório public contém ${files.length} arquivos`);
      
      // Verificar arquivos críticos
      const hasIndexHtml = files.includes('index.html');
      const hasAssets = files.some(f => f.startsWith('assets'));
      
      if (hasIndexHtml) {
        logSuccess('index.html encontrado em public/');
      } else {
        logError('index.html não encontrado em public/');
      }
      
      if (hasAssets) {
        logSuccess('Diretório/arquivos de assets encontrados');
      } else {
        logWarning('Nenhum assets/ encontrado em public/');
      }
      
      console.log('\nArquivos em public/:');
      console.log(files.join(', '));
    }
  } catch (err) {
    logError(`Erro ao listar arquivos em public/: ${err.message}`);
  }
} else {
  logError('Diretório public/ não existe');
}

// 5. Verificação de scripts de build
logHeader('SCRIPTS DE BUILD');
try {
  const packageJson = require('./package.json');
  if (packageJson.scripts) {
    if (packageJson.scripts.build) {
      logSuccess(`Script de build configurado: ${packageJson.scripts.build}`);
    } else {
      logError('Script de build não encontrado em package.json');
    }
    
    if (packageJson.scripts.start) {
      logSuccess(`Script de start configurado: ${packageJson.scripts.start}`);
    } else {
      logError('Script de start não encontrado em package.json');
    }
    
    if (packageJson.scripts['heroku-postbuild']) {
      logSuccess('Script heroku-postbuild configurado');
    } else {
      logWarning('Script heroku-postbuild não encontrado (usando heroku-postbuild.js por fora)');
    }
  } else {
    logError('Nenhum script encontrado em package.json');
  }
} catch (err) {
  logError(`Erro ao ler package.json: ${err.message}`);
}

// 6. Verificações de implantação Heroku
logHeader('CONFIGURAÇÃO HEROKU');
if (fs.existsSync('./Procfile')) {
  logSuccess('Procfile encontrado');
  
  try {
    const procContent = fs.readFileSync('./Procfile', 'utf8');
    console.log('\nConteúdo do Procfile:');
    console.log(procContent);
    
    if (procContent.includes('npm run start')) {
      logInfo('Procfile usa "npm run start" (padrão)');
    } else if (procContent.includes('node start-heroku.js')) {
      logInfo('Procfile usa script personalizado start-heroku.js');
      
      if (fs.existsSync('./start-heroku.js')) {
        logSuccess('Script start-heroku.js encontrado');
      } else {
        logError('Script start-heroku.js referenciado no Procfile, mas não encontrado');
      }
    }
  } catch (err) {
    logError(`Erro ao ler Procfile: ${err.message}`);
  }
} else {
  logError('Procfile não encontrado (obrigatório para Heroku)');
}

// 7. Resumo e conclusão
logHeader('RESUMO');
if (envErrors > 0 || fileErrors > 0) {
  logError(`Encontrados ${envErrors} erros em variáveis de ambiente e ${fileErrors} erros em arquivos/diretórios.`);
  logError('A aplicação pode não iniciar corretamente no Heroku devido aos problemas acima.');
  
  console.log('\nPara corrigir:');
  if (envErrors > 0) {
    console.log('1. Configure as variáveis de ambiente faltantes no painel do Heroku.');
  }
  
  if (fileErrors > 0) {
    console.log('2. Certifique-se de que o processo de build está criando os arquivos necessários.');
    console.log('   - Verifique o script heroku-postbuild.js');
    console.log('   - Verifique se os arquivos estáticos são copiados para o diretório public/');
  }
} else {
  logSuccess('Nenhum erro crítico detectado. A configuração do servidor parece correta.');
}