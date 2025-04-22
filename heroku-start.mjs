#!/usr/bin/env node

/**
 * Script de inicialização simplificado para Heroku
 * 
 * Este script inicia o servidor de forma direta, sem complicações.
 * Usa a sintaxe ESM compatível com o "type": "module" em package.json.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando aplicação Shopee Entregas no Heroku');
console.log(`Data/Hora: ${new Date().toISOString()}`);
console.log(`Versão Node: ${process.version}`);

// Configurar ambiente para produção
process.env.NODE_ENV = 'production';

// Verificar arquivo principal
const mainFile = path.join(process.cwd(), 'dist', 'index.js');
if (!fs.existsSync(mainFile)) {
  console.error('ERRO FATAL: Arquivo principal não encontrado em dist/index.js');
  console.error('Verifique se o build foi concluído corretamente.');
  process.exit(1);
}

// Verificar diretório public para arquivos estáticos e tentar corrigir se necessário
const publicDir = path.join(process.cwd(), 'public');
const distDir = path.join(process.cwd(), 'dist');
const distClientDir = path.join(distDir, 'client');

// Se public não existir ou estiver vazio, tentar copiar os arquivos
if (!fs.existsSync(publicDir) || !fs.existsSync(path.join(publicDir, 'index.html'))) {
  console.log('Diretório public não encontrado ou está sem index.html');
  console.log('Tentando copiar arquivos estáticos...');
  
  // Criar diretório public se não existir
  if (!fs.existsSync(publicDir)) {
    console.log('Criando diretório public...');
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Tentar copiar de dist/client
  if (fs.existsSync(distClientDir) && fs.existsSync(path.join(distClientDir, 'index.html'))) {
    console.log('Encontrado index.html em dist/client, copiando para public...');
    try {
      spawn('cp', ['-r', `${distClientDir}/*`, publicDir], { shell: true, stdio: 'inherit' });
    } catch (err) {
      console.error('Erro ao copiar arquivos:', err.message);
    }
  } 
  // Tentar copiar diretamente de dist
  else if (fs.existsSync(path.join(distDir, 'index.html'))) {
    console.log('Encontrado index.html em dist, copiando para public...');
    try {
      spawn('cp', ['-r', `${distDir}/*`, publicDir], { shell: true, stdio: 'inherit' });
    } catch (err) {
      console.error('Erro ao copiar arquivos:', err.message);
    }
  }
  // Se o diretório dist não contiver o index.html, procurar no source do projeto
  else if (fs.existsSync(path.join(process.cwd(), 'client/index.html'))) {
    console.log('Encontrado index.html em client/, copiando para public...');
    try {
      spawn('cp', ['-r', `${path.join(process.cwd(), 'client')}/*`, publicDir], { shell: true, stdio: 'inherit' });
    } catch (err) {
      console.error('Erro ao copiar arquivos:', err.message);
    }
  } else {
    console.warn('AVISO: Não foi possível encontrar index.html em nenhum local conhecido.');
    console.warn('A interface web pode não funcionar corretamente.');
  }
}

// Verificar resultado
if (fs.existsSync(publicDir)) {
  if (fs.existsSync(path.join(publicDir, 'index.html'))) {
    const publicFiles = fs.readdirSync(publicDir);
    console.log(`✅ Diretório public configurado corretamente com ${publicFiles.length} arquivos.`);
  } else {
    console.warn('⚠️ Diretório public existe, mas não contém index.html.');
    console.warn('  A interface web pode não funcionar corretamente.');
  }
} else {
  console.warn('⚠️ Não foi possível criar o diretório public.');
  console.warn('  A interface web pode não funcionar corretamente.');
}

// Iniciar o servidor com configurações ESM
console.log('Iniciando o servidor...');

const args = [
  // Configurações de módulos ES
  '--experimental-specifier-resolution=node',
  
  // Arquivo principal
  mainFile
];

console.log(`Comando: node ${args.join(' ')}`);

// Criar processo filho para o servidor
const serverProcess = spawn('node', args, {
  stdio: 'inherit',
  env: process.env
});

// Manipular eventos do processo
serverProcess.on('error', (error) => {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Servidor encerrado com código: ${code}`);
  process.exit(code);
});

// Manipular sinais do sistema
process.on('SIGINT', () => {
  console.log('Recebido SIGINT, encerrando...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, encerrando...');
  serverProcess.kill('SIGTERM');
});