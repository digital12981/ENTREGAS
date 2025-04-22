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

// 4. Criar diretório public se necessário
console.log('Ensuring public directory exists...');
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// 5. Copiar arquivos estáticos do cliente para o diretório public
const distClientDir = path.resolve(distDir, 'client');
if (fs.existsSync(distClientDir)) {
  console.log('Found client files in dist/client, copying to public...');
  try {
    execCommand(`cp -r ${distClientDir}/* ${publicDir}/`);
  } catch (err) {
    console.warn('Warning: Could not copy files from dist/client to public');
  }
} 
// Se dist/client não existir, verificar se temos index.html diretamente em dist
else if (fs.existsSync(path.resolve(distDir, 'index.html'))) {
  console.log('Found index.html in dist, copying to public...');
  try {
    // Copiar somente arquivos que não são do servidor
    const distFiles = fs.readdirSync(distDir)
      .filter(file => !file.endsWith('.js') && file !== 'server');
    
    for (const file of distFiles) {
      const srcPath = path.resolve(distDir, file);
      const destPath = path.resolve(publicDir, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        execCommand(`mkdir -p ${destPath}`);
        execCommand(`cp -r ${srcPath}/* ${destPath}/`);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  } catch (err) {
    console.warn('Warning: Error copying files from dist to public:', err.message);
  }
} else {
  console.warn('Warning: Could not find static files in expected locations');
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