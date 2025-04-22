/**
 * Script para verificar a estrutura de arquivos esperada
 * e corrigir a localização dos arquivos estáticos se necessário
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  console.log(title);
  console.log('='.repeat(80));
}

function execCommand(command) {
  try {
    return execSync(command).toString();
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

// Informações do ambiente
logSection('AMBIENTE');
console.log('Timestamp:', new Date().toISOString());
console.log('Node Version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Current Directory:', process.cwd());

// Verificar diretórios importantes
logSection('DIRETÓRIOS');
const directoriesToCheck = ['dist', 'dist/client', 'public'];

directoriesToCheck.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  console.log(`Directory ${dir}: ${fs.existsSync(fullPath) ? 'exists' : 'missing'}`);
});

// Conteúdo de diretórios
logSection('CONTEÚDO DOS DIRETÓRIOS');
directoriesToCheck.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`\nContents of ${dir}:`);
    try {
      const files = fs.readdirSync(fullPath);
      console.log(files.join(', '));
      
      // Verificar se tem index.html
      if (files.includes('index.html')) {
        console.log(`✅ ${dir} has index.html`);
      } else {
        console.log(`❌ ${dir} does NOT have index.html`);
      }
    } catch (err) {
      console.log(`Error reading directory: ${err.message}`);
    }
  }
});

// Verificar a estrutura do sistema de arquivos
logSection('ESTRUTURA DE ARQUIVOS');
console.log(execCommand('find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" | sort'));

// Verificar se o index.html está onde deveria
logSection('INDEX.HTML');
const possibleIndexLocations = [
  'public/index.html',
  'dist/index.html',
  'dist/client/index.html'
];

possibleIndexLocations.forEach(location => {
  const fullPath = path.join(process.cwd(), location);
  console.log(`${location}: ${fs.existsSync(fullPath) ? 'exists' : 'missing'}`);
  
  if (fs.existsSync(fullPath)) {
    // Mostrar primeiras linhas do arquivo
    const content = fs.readFileSync(fullPath, 'utf8').split('\n').slice(0, 5).join('\n');
    console.log('First 5 lines:');
    console.log(content);
  }
});

// Corrigir estrutura se necessário
logSection('CORREÇÃO DE ESTRUTURA');
let correctionsMade = false;

// Se dist/client tem index.html mas public não tem, copiar
if (fs.existsSync(path.join(process.cwd(), 'dist/client/index.html')) && 
   !fs.existsSync(path.join(process.cwd(), 'public/index.html'))) {
  
  console.log('Found index.html in dist/client but not in public. Copying...');
  
  // Criar diretório public se não existir
  if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
    fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
  }
  
  // Copiar todos os arquivos de dist/client para public
  const files = fs.readdirSync(path.join(process.cwd(), 'dist/client'));
  files.forEach(file => {
    const source = path.join(process.cwd(), 'dist/client', file);
    const target = path.join(process.cwd(), 'public', file);
    
    fs.copyFileSync(source, target);
    console.log(`Copied ${file} to public/`);
  });
  
  correctionsMade = true;
}
// Se dist tem index.html mas public não tem, copiar
else if (fs.existsSync(path.join(process.cwd(), 'dist/index.html')) && 
        !fs.existsSync(path.join(process.cwd(), 'public/index.html'))) {
  
  console.log('Found index.html in dist but not in public. Copying...');
  
  // Criar diretório public se não existir
  if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
    fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
  }
  
  // Copiar todos os arquivos de dist para public
  const files = fs.readdirSync(path.join(process.cwd(), 'dist'));
  files.forEach(file => {
    const source = path.join(process.cwd(), 'dist', file);
    const target = path.join(process.cwd(), 'public', file);
    
    if (fs.statSync(source).isFile()) {
      fs.copyFileSync(source, target);
      console.log(`Copied ${file} to public/`);
    } else {
      console.log(`Skipping directory ${file}`);
    }
  });
  
  correctionsMade = true;
}

if (!correctionsMade) {
  console.log('No corrections needed or possible with the current file structure.');
}

logSection('DIAGNÓSTICO CONCLUÍDO');