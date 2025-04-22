const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// 4. Executar o script de correção de diretórios estáticos
console.log('Running static directory fixup script...');
execCommand('node fixup-static-dirs.js');

// 5. Verificar permissões de arquivos importantes
console.log('Checking file permissions...');
execCommand('chmod +x production-loader.js');
execCommand('chmod +x fixup-static-dirs.js');

// 6. Exibir estrutura de diretórios para debug
console.log('Directory structure:');
execCommand('find . -type d -maxdepth 3 -not -path "*/node_modules/*" -not -path "*/.git/*" | sort');

// 7. Verificar conteúdo do diretório public
const publicDir = path.resolve(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  console.log('Files in public directory:');
  execCommand('find public -type f -maxdepth 3 | sort');
  
  // Verificar se index.html existe
  if (fs.existsSync(path.join(publicDir, 'index.html'))) {
    console.log('SUCCESS: index.html found in public directory!');
  } else {
    console.warn('WARNING: index.html not found in public directory!');
  }
}

console.log('Heroku postbuild completed successfully!');