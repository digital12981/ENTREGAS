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

// Verificar diretório public para arquivos estáticos
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  const hasIndexHtml = fs.existsSync(path.join(publicDir, 'index.html'));
  console.log(`Diretório public ${hasIndexHtml ? 'tem' : 'NÃO tem'} index.html`);
  
  if (hasIndexHtml) {
    const publicFiles = fs.readdirSync(publicDir);
    console.log(`Total de arquivos em public: ${publicFiles.length}`);
  } else {
    console.warn('AVISO: index.html não encontrado. A interface web pode não funcionar corretamente.');
  }
} else {
  console.warn('AVISO: Diretório public não encontrado. A interface web pode não funcionar corretamente.');
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