#!/usr/bin/env node

/**
 * Script de inicialização da aplicação na Heroku
 * Este script é responsável por iniciar a aplicação Node.js na Heroku
 * e garantir que todos os componentes necessários estejam funcionando.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração de caminhos para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

// Configurar porta
const PORT = process.env.PORT || 5000;
process.env.PORT = PORT.toString();

console.log('🚀 Iniciando aplicação na Heroku...');
console.log(`📌 Diretório atual: ${rootDir}`);
console.log(`📌 Porta: ${PORT}`);
console.log(`📌 Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
console.log(`📌 Timestamp: ${new Date().toISOString()}`);

// 1. Verificação de arquivos essenciais
console.log('\n📋 Verificando arquivos essenciais antes de iniciar...');

// Verificar existência do diretório dist
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ ERRO: Diretório dist não encontrado!');
  console.log('Tentando criar diretório...');
  try {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('✅ Diretório dist criado com sucesso.');
  } catch (err) {
    console.error(`❌ Falha ao criar diretório dist: ${err.message}`);
  }
}

// Arquivos críticos para o funcionamento da aplicação
const criticalFiles = [
  'dist/server/index.js',
  'package.json'
];

let canProceed = true;
criticalFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ERRO: Arquivo crítico não encontrado: ${file}`);
    canProceed = false;
  } else {
    console.log(`✅ Arquivo crítico encontrado: ${file}`);
  }
});

if (!canProceed) {
  console.error('\n❌ FALHA: Não é possível iniciar a aplicação devido a arquivos críticos ausentes.');
  process.exit(1);
}

// 2. Verificação dos arquivos estáticos
console.log('\n📊 Verificando arquivos estáticos...');

// Diretórios onde os arquivos estáticos podem estar
const staticDirs = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'dist', 'public'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'dist', 'server', 'public')
];

let hasIndexHtml = false;
let hasAssets = false;

for (const dir of staticDirs) {
  const exists = fs.existsSync(dir);
  const isDir = exists ? fs.statSync(dir).isDirectory() : false;
  
  if (exists && isDir) {
    console.log(`✅ Diretório estático encontrado: ${path.relative(rootDir, dir)}`);
    
    // Verificar index.html
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      hasIndexHtml = true;
      console.log(`  - index.html encontrado (${fs.statSync(indexPath).size} bytes)`);
    }
    
    // Verificar diretório assets
    const assetsDir = path.join(dir, 'assets');
    if (fs.existsSync(assetsDir) && fs.statSync(assetsDir).isDirectory()) {
      hasAssets = true;
      const files = fs.readdirSync(assetsDir);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      const cssFiles = files.filter(f => f.endsWith('.css'));
      
      console.log(`  - diretório assets encontrado com ${jsFiles.length} JS e ${cssFiles.length} CSS`);
    }
  }
}

if (!hasIndexHtml) {
  console.warn('⚠️ AVISO: Nenhum arquivo index.html encontrado nos diretórios estáticos!');
}

if (!hasAssets) {
  console.warn('⚠️ AVISO: Nenhum diretório assets encontrado nos diretórios estáticos!');
}

// 3. Tentar corrigir problemas de arquivos estáticos
console.log('\n🔧 Executando scripts de correção de arquivos estáticos...');

try {
  const fixScripts = [
    'node rebuild-static.mjs',
    'node create-basic-assets.mjs',
    'node update-vite-html.mjs',
    'node fix-static-paths.mjs',
    'node copy-static-files.mjs'
  ];
  
  for (const cmd of fixScripts) {
    try {
      console.log(`Executando: ${cmd}`);
      const execSync = (await import('child_process')).execSync;
      execSync(cmd, { stdio: 'inherit' });
    } catch (err) {
      console.warn(`⚠️ AVISO: Falha ao executar ${cmd}: ${err.message}`);
    }
  }
} catch (err) {
  console.warn(`⚠️ AVISO: Falha ao executar scripts de correção: ${err.message}`);
}

// 4. Iniciar o servidor Node.js
console.log('\n🚀 Iniciando servidor Node.js...');

// Registrar manipuladores de eventos para processo
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recebido SIGINT. Encerrando servidor...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error(`Exceção não tratada: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// Opções de comando para iniciar o servidor
let serverCmd = 'node';
let serverArgs = ['dist/server/index.js'];

// Verificar se estamos em desenvolvimento ou produção
if (process.env.NODE_ENV !== 'production') {
  console.log('Ambiente de desenvolvimento detectado.');
  
  // Tentar usar tsx para desenvolvimento se disponível
  try {
    const execSync = (await import('child_process')).execSync;
    execSync('which tsx', { stdio: 'ignore' });
    
    console.log('Usando tsx para desenvolvimento...');
    serverCmd = 'tsx';
    serverArgs = ['server/index.ts'];
  } catch (err) {
    console.log('tsx não encontrado, usando node...');
  }
}

console.log(`Comando de servidor: ${serverCmd} ${serverArgs.join(' ')}`);

// Iniciar o servidor como processo filho
const server = spawn(serverCmd, serverArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: PORT.toString()
  }
});

console.log(`Servidor iniciado com PID ${server.pid}`);

server.on('error', (err) => {
  console.error(`❌ Erro ao iniciar o servidor: ${err.message}`);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`❌ Servidor encerrado com código ${code} e sinal ${signal}`);
    process.exit(code || 1);
  } else {
    console.log(`✅ Servidor encerrado normalmente.`);
    process.exit(0);
  }
});