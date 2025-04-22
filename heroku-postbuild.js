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

// 2. Construir o aplicativo Node.js usando nosso script personalizado
console.log('Building Node.js application with our custom script...');
execCommand('node heroku-build.js');

// 3. Log do ambiente para debug
console.log('Environment information:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT || '(not set)'}`);
console.log(`Current directory: ${process.cwd()}`);

const publicDir = path.resolve(process.cwd(), 'public');
const distDir = path.resolve(process.cwd(), 'dist');

console.log(`Public directory exists: ${fs.existsSync(publicDir)}`);
console.log(`Dist directory exists: ${fs.existsSync(distDir)}`);

if (fs.existsSync(publicDir)) {
  console.log('Files in public directory:');
  execCommand('ls -la public');
}

if (fs.existsSync(distDir)) {
  console.log('Files in dist directory:');
  execCommand('ls -la dist');
}

console.log('Heroku postbuild completed successfully!');