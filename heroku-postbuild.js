const { execSync } = require('child_process');
const fs = require('fs');

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

console.log('Heroku postbuild completed successfully!');