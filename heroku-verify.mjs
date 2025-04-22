#!/usr/bin/env node

/**
 * Script de verificação para garantir que o ambiente Heroku
 * está configurado corretamente para a aplicação.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('===== DIAGNÓSTICO DO AMBIENTE HEROKU =====');
console.log(`Data/Hora: ${new Date().toISOString()}`);
console.log(`Node.js: ${process.version}`);

// Função para log colorido
function logOk(message) {
  console.log(`✅ ${message}`);
}

function logWarn(message) {
  console.log(`⚠️ ${message}`);
}

function logError(message) {
  console.log(`❌ ${message}`);
}

function execCommand(command) {
  console.log(`\n>> ${command}`);
  const result = spawnSync(command, { shell: true, stdio: 'inherit' });
  return result.status === 0;
}

// Verificar variáveis de ambiente
console.log('\n===== VARIÁVEIS DE AMBIENTE =====');
const requiredVars = ['NODE_ENV', 'DATABASE_URL', 'FOR4PAYMENTS_SECRET_KEY'];
const optionalVars = ['PORT', 'FOR4PAYMENTS_API_URL', 'HOST'];

let missingVars = 0;
requiredVars.forEach(varName => {
  if (process.env[varName]) {
    logOk(`${varName}: configurado`);
  } else {
    logError(`${varName}: NÃO configurado (obrigatório)`);
    missingVars++;
  }
});

optionalVars.forEach(varName => {
  if (process.env[varName]) {
    logOk(`${varName}: configurado (${process.env[varName]})`);
  } else {
    logWarn(`${varName}: não configurado (opcional)`);
  }
});

if (missingVars > 0) {
  logError(`Existem ${missingVars} variáveis obrigatórias não configuradas.`);
}

// Verificar diretórios e arquivos
console.log('\n===== DIRETÓRIOS E ARQUIVOS =====');
const criticalPaths = [
  { path: 'dist', type: 'dir', required: true, desc: 'Diretório de build' },
  { path: 'dist/index.js', type: 'file', required: true, desc: 'Arquivo principal do servidor' },
  { path: 'public', type: 'dir', required: true, desc: 'Diretório de arquivos estáticos' },
  { path: 'public/index.html', type: 'file', required: true, desc: 'Arquivo HTML principal' },
  { path: 'heroku-start.mjs', type: 'file', required: true, desc: 'Script de inicialização' },
  { path: 'Procfile', type: 'file', required: true, desc: 'Configuração Heroku' }
];

let missingFiles = 0;
criticalPaths.forEach(({ path: filePath, type, required, desc }) => {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const isDir = fs.statSync(fullPath).isDirectory();
    if ((type === 'dir' && isDir) || (type === 'file' && !isDir)) {
      logOk(`${desc} (${filePath}): encontrado`);
    } else {
      logError(`${desc} (${filePath}): tipo incorreto (esperado ${type})`);
      missingFiles++;
    }
  } else if (required) {
    logError(`${desc} (${filePath}): NÃO encontrado (obrigatório)`);
    missingFiles++;
  } else {
    logWarn(`${desc} (${filePath}): não encontrado (opcional)`);
  }
});

if (missingFiles > 0) {
  logError(`Existem ${missingFiles} arquivos/diretórios obrigatórios ausentes.`);
}

// Verificar conteúdo de arquivos importantes
console.log('\n===== CONTEÚDO DE ARQUIVOS =====');

// Verificar Procfile
if (fs.existsSync(path.join(process.cwd(), 'Procfile'))) {
  const procfileContent = fs.readFileSync(path.join(process.cwd(), 'Procfile'), 'utf8');
  console.log('Procfile:');
  console.log(procfileContent);
  
  if (procfileContent.includes('heroku-start.mjs')) {
    logOk('Procfile configurado para usar heroku-start.mjs');
  } else {
    logError('Procfile não está configurado para usar heroku-start.mjs');
  }
}

// Verificar conteúdo do diretório public
if (fs.existsSync(path.join(process.cwd(), 'public'))) {
  const publicFiles = fs.readdirSync(path.join(process.cwd(), 'public'));
  console.log(`\nArquivos em public (${publicFiles.length} arquivos):`);
  
  if (publicFiles.length > 20) {
    console.log(`${publicFiles.slice(0, 20).join(', ')}... (e mais ${publicFiles.length - 20} arquivos)`);
  } else {
    console.log(publicFiles.join(', '));
  }
  
  const hasIndexHtml = publicFiles.includes('index.html');
  const hasAssets = publicFiles.some(f => f.startsWith('assets'));
  
  if (hasIndexHtml) {
    logOk('index.html encontrado em public/');
  } else {
    logError('index.html NÃO encontrado em public/');
  }
  
  if (hasAssets) {
    logOk('Diretório/arquivos assets encontrados');
  } else {
    logWarn('Nenhum arquivo assets/ encontrado em public/');
  }
}

// Resumo
console.log('\n===== RESUMO =====');
if (missingVars === 0 && missingFiles === 0) {
  logOk('Todos os requisitos verificados estão em ordem.');
  console.log('A aplicação deve funcionar corretamente no ambiente Heroku.');
} else {
  const issues = [];
  if (missingVars > 0) issues.push(`${missingVars} variáveis de ambiente ausentes`);
  if (missingFiles > 0) issues.push(`${missingFiles} arquivos/diretórios ausentes`);
  
  logError(`Existem problemas que podem impedir o funcionamento correto: ${issues.join(', ')}.`);
  console.log('Corrija os problemas acima antes de fazer o deploy na Heroku.');
}

console.log('\nVerificação de ambiente concluída.');