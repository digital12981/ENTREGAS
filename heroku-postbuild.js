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

// Verificar variáveis de ambiente
console.log('Checking environment variables...');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`PORT: ${process.env.PORT || 'not set'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
console.log(`FOR4PAYMENTS_SECRET_KEY: ${process.env.FOR4PAYMENTS_SECRET_KEY ? 'configured' : 'not configured'}`);

// Construir o aplicativo Node.js (ignorando dependências Python)
console.log('Building Node.js application...');
execCommand('npm run build');

// Criar um arquivo de validação para confirmar build bem-sucedido
fs.writeFileSync('dist/build-info.json', JSON.stringify({
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || 'unknown'
}));

console.log('Heroku postbuild completed successfully!');