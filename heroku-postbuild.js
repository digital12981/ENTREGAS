const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running Heroku postbuild script...');

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

// 3. Preparar o diretório public (onde o serveStatic busca arquivos)
console.log('Ensuring correct static file structure...');

// Criar diretório public se não existir
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Verificar local onde os arquivos estáticos foram gerados
const distClientDir = path.resolve(process.cwd(), 'dist/client');
const distDir = path.resolve(process.cwd(), 'dist');

if (fs.existsSync(distClientDir) && fs.readdirSync(distClientDir).includes('index.html')) {
  console.log('Found static files in dist/client, copying to public...');
  execCommand('cp -r dist/client/* public/');
} else if (fs.existsSync(distDir) && fs.readdirSync(distDir).includes('index.html')) {
  console.log('Found static files in dist, copying to public...');
  execCommand('cp -r dist/* public/');
} else {
  console.log('Could not find index.html in expected locations');
  console.log('Current file structure:');
  execCommand('find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" | sort');
}

// 4. Executar diagnóstico para debug
console.log('Running diagnostic script...');
execCommand('node static.js');

console.log('Heroku postbuild completed successfully!');