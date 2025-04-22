/**
 * Carregador de produção para o Heroku
 * 
 * Este script é uma alternativa para iniciar a aplicação em produção,
 * utilizando abordagens que funcionam melhor no ambiente Heroku.
 */

// Importações de módulos Node.js
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

console.log('Iniciando carregador de produção para Heroku...');
console.log('Data/hora atual:', new Date().toISOString());
console.log('Versão do Node.js:', process.version);

// Definir as variáveis de ambiente necessárias
process.env.NODE_ENV = 'production';

// Verificar diretórios essenciais
const distDir = path.join(process.cwd(), 'dist');
const publicDir = path.join(process.cwd(), 'public');

// Verificar o diretório dist
if (!fs.existsSync(distDir)) {
  console.error('ERRO FATAL: O diretório dist não existe!');
  console.error('A aplicação não foi compilada corretamente.');
  process.exit(1);
}

// Verificar se temos o arquivo principal do servidor
const serverMainFile = path.join(distDir, 'index.js');
if (!fs.existsSync(serverMainFile)) {
  console.error('ERRO FATAL: Arquivo principal do servidor não encontrado em dist/index.js');
  console.error('A aplicação não foi compilada corretamente.');
  process.exit(1);
}

// Verificar e preparar diretório de arquivos estáticos
if (!fs.existsSync(publicDir)) {
  console.log('Criando diretório public...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Verificar arquivos estáticos
const clientDistDir = path.join(distDir, 'client');
if (fs.existsSync(clientDistDir)) {
  const clientFiles = fs.readdirSync(clientDistDir);
  console.log(`Diretório dist/client contém ${clientFiles.length} arquivos.`);
  
  // Se temos index.html em dist/client mas não em public, copiar
  if (clientFiles.includes('index.html') && !fs.existsSync(path.join(publicDir, 'index.html'))) {
    console.log('Copiando arquivos estáticos de dist/client para public...');
    try {
      execSync(`cp -r ${clientDistDir}/* ${publicDir}/`, { stdio: 'inherit' });
      console.log('Arquivos copiados com sucesso.');
    } catch (error) {
      console.error('Erro ao copiar arquivos:', error.message);
    }
  }
} else {
  console.warn('Atenção: Diretório dist/client não encontrado.');
  
  // Verificar se temos index.html diretamente em dist
  if (fs.existsSync(path.join(distDir, 'index.html')) && !fs.existsSync(path.join(publicDir, 'index.html'))) {
    console.log('Copiando arquivos estáticos de dist para public...');
    try {
      // Lista todos os arquivos e diretórios (exceto index.js que é o servidor)
      const distFiles = fs.readdirSync(distDir)
        .filter(file => file !== 'index.js' && file !== 'server');
      
      // Copiar cada item para public
      for (const file of distFiles) {
        const sourcePath = path.join(distDir, file);
        const destPath = path.join(publicDir, file);
        
        if (fs.statSync(sourcePath).isDirectory()) {
          // Se for diretório, criar o diretório de destino e copiar recursivamente
          if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
          }
          execSync(`cp -r ${sourcePath}/* ${destPath}/`, { stdio: 'inherit' });
        } else {
          // Se for arquivo, copiar diretamente
          fs.copyFileSync(sourcePath, destPath);
        }
      }
      console.log('Arquivos copiados com sucesso.');
    } catch (error) {
      console.error('Erro ao copiar arquivos:', error.message);
    }
  }
}

// Verificar se temos index.html em public após as operações
if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
  console.warn('ATENÇÃO: index.html não encontrado no diretório public!');
  console.warn('O servidor pode iniciar, mas a interface web não funcionará corretamente.');
} else {
  console.log('index.html encontrado em public/.');
}

// Definir argumentos para o Node.js
const nodeArgs = [
  // Habilitar resolução de especificadores para ESM
  '--experimental-specifier-resolution=node',
  
  // Arquivo principal
  serverMainFile
];

console.log(`Iniciando servidor: node ${nodeArgs.join(' ')}`);

// Iniciar a aplicação
const serverProcess = spawn('node', nodeArgs, {
  stdio: 'inherit',
  env: process.env
});

// Manipular eventos do processo filho
serverProcess.on('error', (err) => {
  console.error('Erro ao iniciar o servidor:', err);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Servidor encerrado com código de saída ${code}`);
  process.exit(code);
});

// Capturar sinais para encerramento gracioso
process.on('SIGINT', () => {
  console.log('Recebido SIGINT, encerrando o servidor...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, encerrando o servidor...');
  serverProcess.kill('SIGTERM');
});