#!/usr/bin/env node

/**
 * Script de correção de diretórios estáticos (Versão ESM)
 * 
 * Este script verifica e corrige problemas com diretórios e arquivos estáticos
 * antes da implantação em produção.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

// Obter __dirname equivalente no modo ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function error(message) {
  console.error(`[${new Date().toISOString()}] ERRO: ${message}`);
}

function warn(message) {
  console.warn(`[${new Date().toISOString()}] AVISO: ${message}`);
}

function execCommand(command) {
  log(`Executando: ${command}`);
  const result = spawnSync(command, { shell: true, stdio: 'inherit' });
  if (result.status !== 0) {
    warn(`Comando falhou com código ${result.status}`);
  }
  return result.status === 0;
}

// Verificar diretórios críticos
log('Iniciando verificação de diretórios estáticos...');

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const distClientDir = path.join(distDir, 'client');

// Criar array com os diretórios que existem
const existingDirs = [];
if (fs.existsSync(distDir)) existingDirs.push('dist');
if (fs.existsSync(publicDir)) existingDirs.push('public');
if (fs.existsSync(distClientDir)) existingDirs.push('dist/client');

log(`Diretórios encontrados: ${existingDirs.join(', ')}`);

// Verificar se o build existe
if (!fs.existsSync(distDir)) {
  error('Diretório dist não encontrado! Executando build...');
  if (!execCommand('npm run build')) {
    error('Falha ao executar build. Verifique os erros acima.');
    process.exit(1);
  }
}

// Verificar novamente o diretório dist após o possível build
if (!fs.existsSync(distDir)) {
  error('Diretório dist ainda não existe mesmo após build! Algo está errado com o processo de build.');
  process.exit(1);
}

// Verificar se temos o arquivo principal do servidor
const serverFile = path.join(distDir, 'index.js');
if (!fs.existsSync(serverFile)) {
  error('Arquivo principal do servidor (dist/index.js) não encontrado!');
  error('Revise o script de build em package.json.');
  process.exit(1);
}

// Verificar e criar diretório public se necessário
if (!fs.existsSync(publicDir)) {
  log('Criando diretório public...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Determinar onde estão os arquivos estáticos e copiar para public se necessário
let staticFilesFound = false;

// Verificar dist/client
if (fs.existsSync(distClientDir)) {
  const files = fs.readdirSync(distClientDir);
  if (files.includes('index.html')) {
    log('Encontrado index.html em dist/client.');
    staticFilesFound = true;
    
    // Copiar para public se index.html ainda não estiver lá
    if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
      log('Copiando arquivos de dist/client para public...');
      execCommand(`cp -r ${distClientDir}/* ${publicDir}/`);
    }
  }
}

// Se não encontrou em dist/client, verificar diretamente em dist
if (!staticFilesFound && fs.existsSync(path.join(distDir, 'index.html'))) {
  log('Encontrado index.html diretamente em dist.');
  staticFilesFound = true;
  
  // Copiar para public se index.html ainda não estiver lá
  if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
    log('Copiando arquivos de dist para public...');
    
    // Listar arquivos em dist (exceto index.js e diretório server se existirem)
    const distFiles = fs.readdirSync(distDir).filter(file => 
      file !== 'index.js' && file !== 'server' && 
      !file.endsWith('.mjs') && !file.endsWith('.cjs'));
    
    // Copiar cada arquivo/diretório
    distFiles.forEach(file => {
      const srcPath = path.join(distDir, file);
      const destPath = path.join(publicDir, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        execCommand(`cp -r ${srcPath}/* ${destPath}/`);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }
}

// Verificar se temos index.html em public após as operações
if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
  warn('index.html não encontrado no diretório public!');
  warn('A aplicação não funcionará corretamente. O processo de build pode estar configurado incorretamente.');
} else {
  log('index.html encontrado em public. Tudo certo!');
  
  // Listar arquivos em public
  const publicFiles = fs.readdirSync(publicDir);
  log(`Diretório public contém ${publicFiles.length} arquivos.`);
  log(`Arquivos: ${publicFiles.join(', ')}`);
}

log('Verificação de diretórios estáticos concluída.');