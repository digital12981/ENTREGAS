/**
 * Script de pós-build para Heroku (versão ESM)
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter __dirname equivalente no modo ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running Heroku postbuild script...');
console.log('Node version:', process.version);
console.log('Timestamp:', new Date().toISOString());

// Função para executar um comando e exibir o log
function execCommand(command) {
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// 1. Instalação do Python e dependências
console.log('Installing Python dependencies...');
execCommand('pip install -r heroku-requirements.txt');

// 2. Construir o aplicativo Node.js
console.log('Building Node.js application...');
execCommand('npm run build');

// 3. Verificar se o build foi bem-sucedido
const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.error('FATAL: dist directory not found after build!');
  process.exit(1);
}

// 4. Executar script dedicado para copiar arquivos estáticos
console.log('Copiando arquivos estáticos...');
try {
  execCommand('node copy-static-files.mjs');
} catch (err) {
  console.error('Erro ao copiar arquivos estáticos:', err);
  console.error('Tentando método alternativo...');
  
  // Fallback: método manual
  console.log('Criando diretório public manualmente...');
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Verificar em dist/client
  const distClientDir = path.resolve(distDir, 'client');
  if (fs.existsSync(distClientDir) && fs.existsSync(path.join(distClientDir, 'index.html'))) {
    console.log('Encontrado index.html em dist/client, copiando para public...');
    execCommand(`cp -r ${distClientDir}/* ${publicDir}/`);
  } 
  // Verificar em dist
  else if (fs.existsSync(path.join(distDir, 'index.html'))) {
    console.log('Encontrado index.html em dist, copiando para public...');
    execCommand(`cp -r ${distDir}/* ${publicDir}/`);
  } else {
    console.error('ERRO: Não foi possível encontrar arquivos estáticos!');
  }
}

// 6. Verificar permissões de arquivos importantes
console.log('Checking file permissions...');
execCommand('chmod +x production-loader.mjs');

// 7. Verificar conteúdo do diretório public
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  console.log(`Public directory contains ${publicFiles.length} files.`);
  
  if (fs.existsSync(path.join(publicDir, 'index.html'))) {
    console.log('SUCCESS: index.html found in public directory!');
  } else {
    console.warn('WARNING: index.html not found in public directory!');
    console.warn('The web application may not work correctly.');
  }
}

// 8. Mostrar informações do ambiente para debug
console.log('Environment information:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- Current directory:', process.cwd());
console.log('- Directory structure:');
execCommand('find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" | sort');

console.log('Heroku postbuild completed successfully!');