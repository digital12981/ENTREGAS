/**
 * Script para verificar a configuração do servidor e diagnosticar problemas
 * 
 * Uso: node server-check.js
 */

// Importar módulos necessários
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Funções de utilitário para log
function logHeader(message) {
  console.log(`\n===== ${message} =====`);
}

function logError(message) {
  console.log(`❌ ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logWarning(message) {
  console.log(`⚠️ ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️ ${message}`);
}

// Iniciar diagnóstico
console.log('DIAGNÓSTICO DO SERVIDOR SHOPEE ENTREGAS');
console.log('=======================================');
console.log(`Data/Hora: ${new Date().toISOString()}`);
console.log(`Hostname: ${os.hostname()}`);
console.log(`Plataforma: ${os.platform()} ${os.release()}`);
console.log(`Node.js: ${process.version}`);
console.log(`Diretório atual: ${process.cwd()}`);

// Verificar variáveis de ambiente
logHeader('VARIÁVEIS DE AMBIENTE');
const requiredVars = ['NODE_ENV', 'DATABASE_URL', 'FOR4PAYMENTS_SECRET_KEY'];
const optionalVars = ['PORT', 'FOR4PAYMENTS_API_URL', 'HOST'];

let missingVars = 0;
requiredVars.forEach(varName => {
  if (process.env[varName]) {
    logSuccess(`${varName}: ${varName === 'DATABASE_URL' || varName === 'FOR4PAYMENTS_SECRET_KEY' ? 'configurado (valor oculto)' : process.env[varName]}`);
  } else {
    logError(`${varName}: não configurado (obrigatório)`);
    missingVars++;
  }
});

optionalVars.forEach(varName => {
  if (process.env[varName]) {
    logInfo(`${varName}: ${process.env[varName]}`);
  } else {
    logWarning(`${varName}: não configurado (opcional)`);
  }
});

// Verificar estrutura de diretórios
logHeader('ESTRUTURA DE DIRETÓRIOS');
const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const clientDir = path.join(rootDir, 'client');
const serverDir = path.join(rootDir, 'server');

const directoriesToCheck = [
  { path: distDir, name: 'dist' },
  { path: publicDir, name: 'public' },
  { path: clientDir, name: 'client' },
  { path: serverDir, name: 'server' },
  { path: path.join(publicDir, 'assets'), name: 'public/assets' }
];

directoriesToCheck.forEach(({ path: dirPath, name }) => {
  if (fs.existsSync(dirPath)) {
    try {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(dirPath);
        logSuccess(`${name}/: diretório encontrado com ${files.length} arquivos`);
        
        // Mostrar alguns arquivos do diretório
        if (files.length > 0) {
          const sampleFiles = files.slice(0, 5);
          logInfo(`  Exemplos: ${sampleFiles.join(', ')}${files.length > 5 ? ', ...' : ''}`);
        }
      } else {
        logError(`${name}: existe mas não é um diretório`);
      }
    } catch (err) {
      logError(`${name}: erro ao verificar diretório: ${err.message}`);
    }
  } else {
    logError(`${name}/: diretório não encontrado`);
  }
});

// Verificar arquivos críticos
logHeader('ARQUIVOS CRÍTICOS');
const criticalFiles = [
  { path: path.join(distDir, 'index.js'), name: 'dist/index.js', desc: 'Entrada do servidor' },
  { path: path.join(publicDir, 'index.html'), name: 'public/index.html', desc: 'Entrada do frontend' },
  { path: path.join(publicDir, 'favicon.ico'), name: 'public/favicon.ico', desc: 'Favicon' },
  { path: 'Procfile', name: 'Procfile', desc: 'Configuração do Heroku' },
  { path: 'heroku-start.mjs', name: 'heroku-start.mjs', desc: 'Script de inicialização' },
  { path: 'copy-static-files.mjs', name: 'copy-static-files.mjs', desc: 'Copiador de arquivos estáticos' },
  { path: 'create-basic-assets.mjs', name: 'create-basic-assets.mjs', desc: 'Gerador de assets básicos' },
  { path: path.join(publicDir, 'assets', 'basic.css'), name: 'public/assets/basic.css', desc: 'CSS básico' },
  { path: path.join(publicDir, 'assets', 'basic.js'), name: 'public/assets/basic.js', desc: 'JS básico' }
];

criticalFiles.forEach(({ path: filePath, name, desc }) => {
  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        logSuccess(`${name}: encontrado (${stats.size} bytes) - ${desc}`);
      } else {
        logError(`${name}: existe mas não é um arquivo - ${desc}`);
      }
    } catch (err) {
      logError(`${name}: erro ao verificar arquivo: ${err.message} - ${desc}`);
    }
  } else {
    logError(`${name}: não encontrado - ${desc}`);
  }
});

// Verificar conteúdo do Procfile
logHeader('CONTEÚDO DO PROCFILE');
if (fs.existsSync('Procfile')) {
  const procfileContent = fs.readFileSync('Procfile', 'utf8');
  console.log(procfileContent);
} else {
  logError('Procfile não encontrado');
}

// Verificar se o servidor pode iniciar
logHeader('VERIFICAÇÃO DE INICIALIZAÇÃO DO SERVIDOR');
try {
  if (fs.existsSync(path.join(distDir, 'index.js'))) {
    logInfo('Verificando dependências do servidor...');
    
    const hasFavicon = fs.existsSync(path.join(publicDir, 'favicon.ico'));
    const hasIndexHtml = fs.existsSync(path.join(publicDir, 'index.html'));
    const hasAssets = fs.existsSync(path.join(publicDir, 'assets'));
    
    if (hasIndexHtml && hasFavicon && hasAssets) {
      logSuccess('Todos os arquivos estáticos necessários estão presentes');
    } else {
      if (!hasIndexHtml) logError('index.html está faltando');
      if (!hasFavicon) logError('favicon.ico está faltando');
      if (!hasAssets) logError('diretório assets/ está faltando');
    }
    
    const serverReadyMessage = hasIndexHtml && hasFavicon ? 
      'O servidor parece pronto para iniciar' : 
      'O servidor pode iniciar, mas a interface web pode não funcionar corretamente';
    
    logInfo(serverReadyMessage);
  } else {
    logError('O arquivo principal do servidor (dist/index.js) não foi encontrado');
    logError('O servidor não poderá iniciar sem este arquivo');
  }
} catch (err) {
  logError(`Erro ao verificar inicialização do servidor: ${err.message}`);
}

// Sugerir correções
logHeader('SUGESTÕES DE CORREÇÃO');
if (missingVars > 0) {
  logWarning(`Configure as ${missingVars} variáveis de ambiente faltantes`);
}

if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
  logWarning('Execute o script create-basic-assets.mjs para gerar arquivos estáticos básicos');
  logInfo('  Comando: node create-basic-assets.mjs');
}

if (!fs.existsSync(path.join(distDir, 'index.js'))) {
  logWarning('Reconstrua o servidor se estiver faltando dist/index.js');
  logInfo('  Comando: npm run build');
}

// Finalizar diagnóstico
logHeader('RESUMO');
console.log('O diagnóstico do servidor foi concluído.');
console.log('Revise os problemas reportados acima e aplique as correções sugeridas conforme necessário.');
console.log('\nData/hora do fim do diagnóstico:', new Date().toISOString());