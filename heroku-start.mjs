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

// Verificar favicon.ico
const faviconPath = path.join(publicDir, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  console.log('favicon.ico não encontrado. Tentando criar...');
  try {
    const faviconScript = path.join(process.cwd(), 'create-favicon.mjs');
    if (fs.existsSync(faviconScript)) {
      spawn('node', [faviconScript], { stdio: 'inherit', shell: true });
    } else {
      console.warn('Script create-favicon.mjs não encontrado.');
      
      // Criar favicon inline se o script não existir
      console.log('Tentando criar favicon.ico diretamente...');
      
      // Dados binários básicos para um favicon simples
      const faviconData = Buffer.from([
        0, 0, 1, 0, 1, 0, 16, 16, 0, 0, 1, 0, 24, 0, 104, 4, 
        0, 0, 22, 0, 0, 0, 40, 0, 0, 0, 16, 0, 0, 0, 32, 0, 
        0, 0, 1, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 238, 77, 45, 238, 77, 
        45, 238, 77, 45, 238, 77, 45, 238, 77, 45, 238, 77, 45
      ]);
      
      try {
        fs.writeFileSync(faviconPath, faviconData);
        console.log('favicon.ico básico criado com sucesso.');
      } catch (err) {
        console.error('Erro ao criar favicon.ico:', err.message);
      }
    }
  } catch (err) {
    console.error('Erro ao tentar criar favicon.ico:', err.message);
  }
}

// Verificar resultado
if (fs.existsSync(publicDir)) {
  if (fs.existsSync(path.join(publicDir, 'index.html'))) {
    const publicFiles = fs.readdirSync(publicDir);
    const hasFavicon = fs.existsSync(path.join(publicDir, 'favicon.ico'));
    
    console.log(`✅ Diretório public configurado com ${publicFiles.length} arquivos.`);
    console.log(`  index.html: encontrado`);
    console.log(`  favicon.ico: ${hasFavicon ? 'encontrado' : 'NÃO ENCONTRADO'}`);
  } else {
    console.warn('⚠️ Diretório public existe, mas não contém index.html.');
    console.warn('  A interface web pode não funcionar corretamente.');
  }
} else {
  console.warn('⚠️ Não foi possível criar o diretório public.');
  console.warn('  A interface web pode não funcionar corretamente.');
}

// Verificar se precisamos executar o script de reconstrução
if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
  console.log('Executando script de reconstrução...');
  try {
    const rebuildScript = path.join(process.cwd(), 'rebuild-static.mjs');
    if (fs.existsSync(rebuildScript)) {
      spawn('node', [rebuildScript], { stdio: 'inherit', shell: true });
    } else {
      console.warn('Script de reconstrução não encontrado!');
    }
  } catch (err) {
    console.error('Erro ao executar script de reconstrução:', err.message);
  }
}

// Verificar se estamos em um ambiente Heroku
// e definir variáveis de ambiente relevantes
if (process.env.PORT && !process.env.HEROKU) {
  console.log('Ambiente Heroku detectado, definindo variável HEROKU=true');
  process.env.HEROKU = 'true';
}

// Iniciar o servidor com configurações ESM
console.log('Iniciando o servidor...');

const args = [
  // Configurações de módulos ES
  '--experimental-specifier-resolution=node',
  
  // Permitir importações top-level
  '--no-warnings',
  
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