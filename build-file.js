/**
 * Este arquivo serve como alternativa ao heroku-postbuild.js
 * Ele configura corretamente os módulos ESM para produção no Heroku
 * Para usar, execute:
 * heroku config:set BUILD_FILE="node build-file.js"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running custom build script...');

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
console.log('Environment variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`NODE_VERSION: ${process.version}`);
console.log(`NPM_CONFIG_PRODUCTION: ${process.env.NPM_CONFIG_PRODUCTION || 'not set'}`);

// Construir o aplicativo Node.js
console.log('Building Node.js application...');
execCommand('npm run build');

// Criar um arquivo de validação para confirmar build bem-sucedido
const distDir = path.join(__dirname, 'dist');
fs.writeFileSync(
  path.join(distDir, 'build-info.json'), 
  JSON.stringify({
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'unknown'
  })
);

// Garantir que dependências de produção estão instaladas
console.log('Ensuring production dependencies are installed...');
try {
  // Copiar package.json para dist
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Mover dependências dev essenciais para dependências regulares para produção
  const essentialDevDependencies = [
    '@vitejs/plugin-react',
    'esbuild',
    'vite'
  ];
  
  for (const dep of essentialDevDependencies) {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      if (!packageJson.dependencies) packageJson.dependencies = {};
      packageJson.dependencies[dep] = packageJson.devDependencies[dep];
      console.log(`Moved ${dep} to production dependencies`);
    }
  }
  
  // Escrever package-prod.json que será usado em produção
  fs.writeFileSync(
    path.join(distDir, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  
  console.log('Production package.json created');
} catch (error) {
  console.error('Error preparing production dependencies:', error);
}

console.log('Build completed successfully!');