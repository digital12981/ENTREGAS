/**
 * Script de inicialização para o Heroku
 * 
 * Este script serve como uma camada de indireção para iniciar a aplicação
 * e resolver problemas que possam surgir no ambiente de produção do Heroku.
 */
console.log('Starting application in Heroku environment...');

// Verificar e reportar variáveis de ambiente importantes
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || '(not set, will use default)');
console.log('Database URL configured:', !!process.env.DATABASE_URL);
console.log('FOR4PAYMENTS_SECRET_KEY configured:', !!process.env.FOR4PAYMENTS_SECRET_KEY);

// Verificar existência do diretório public
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const publicDir = path.resolve(process.cwd(), 'public');
const distDir = path.resolve(process.cwd(), 'dist');

console.log('Public directory exists:', fs.existsSync(publicDir));
console.log('Dist directory exists:', fs.existsSync(distDir));

// Tentar corrigir a estrutura de arquivos se necessário
if (!fs.existsSync(publicDir) && fs.existsSync(distDir)) {
  console.log('Creating public directory and copying files from dist...');
  try {
    // Criar diretório public
    fs.mkdirSync(publicDir, { recursive: true });
    
    // Verificar o que temos em dist
    const distClientDir = path.resolve(distDir, 'client');
    
    if (fs.existsSync(distClientDir)) {
      console.log('Copying from dist/client to public...');
      execSync('cp -r dist/client/* public/', { stdio: 'inherit' });
    } else {
      // Procurar index.html diretamente em dist
      if (fs.existsSync(path.resolve(distDir, 'index.html'))) {
        console.log('Copying from dist to public...');
        execSync('cp -r dist/* public/', { stdio: 'inherit' });
      }
    }
  } catch (error) {
    console.error('Error fixing directory structure:', error);
  }
}

// Verificar novamente depois da possível correção
if (fs.existsSync(publicDir)) {
  console.log('Files in public directory:');
  try {
    const files = fs.readdirSync(publicDir);
    console.log(files.join(', '));
  } catch (err) {
    console.error('Error reading public directory:', err);
  }
}

// Iniciar a aplicação
console.log('Starting the application...');
process.env.NODE_ENV = 'production';

// Verificar a extensão do arquivo principal
const mainFile = fs.existsSync(path.join(distDir, 'index.js')) 
  ? 'dist/index.js' 
  : 'dist/index.mjs';

console.log(`Using main file: ${mainFile}`);

// Configurar a execução para lidar com módulos ESM
// Usamos o argumento --experimental-specifier-resolution=node para permitir
// que módulos sejam importados sem a extensão .js/.mjs
const args = ['--experimental-specifier-resolution=node'];

// Adicionar o arquivo principal
args.push(mainFile);

// Usar spawn em vez de require para manter os logs no console
console.log(`Executing: node ${args.join(' ')}`);
const child = spawn('node', args, { 
  stdio: 'inherit',
  env: { ...process.env }
});

child.on('exit', (code) => {
  console.log(`Child process exited with code ${code}`);
  process.exit(code);
});

// Manipular sinais para encerramento adequado
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  child.kill('SIGTERM');
});