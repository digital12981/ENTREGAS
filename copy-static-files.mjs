#!/usr/bin/env node

/**
 * Este script copia os arquivos estáticos do frontend para o diretório public
 * para que eles possam ser servidos pelo servidor express.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Iniciando cópia de arquivos estáticos...');
console.log(`Hora atual: ${new Date().toISOString()}`);

// Caminhos importantes
const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const distClientDir = path.join(distDir, 'client');
const publicDir = path.join(rootDir, 'public');

// Função para executar comandos
function exec(command) {
  console.log(`Executando: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Erro ao executar comando: ${error.message}`);
    return false;
  }
}

// Verificar se dist existe
if (!fs.existsSync(distDir)) {
  console.error('ERRO: Diretório dist não encontrado!');
  console.log('Executando build...');
  
  if (!exec('npm run build')) {
    console.error('Falha ao executar build. Abortando.');
    process.exit(1);
  }
  
  // Verificar novamente
  if (!fs.existsSync(distDir)) {
    console.error('ERRO: Diretório dist ainda não existe após build. Algo está errado.');
    process.exit(1);
  }
}

// Criar diretório public se não existir
if (!fs.existsSync(publicDir)) {
  console.log('Criando diretório public...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Verificar possíveis localizações dos arquivos estáticos
let staticFilesFound = false;

// 1. Verificar em dist/client
if (fs.existsSync(distClientDir)) {
  console.log('Diretório dist/client encontrado.');
  
  const files = fs.readdirSync(distClientDir);
  if (files.includes('index.html')) {
    console.log('index.html encontrado em dist/client. Copiando para public...');
    exec(`cp -r ${distClientDir}/* ${publicDir}/`);
    staticFilesFound = true;
  } else {
    console.log('index.html não encontrado em dist/client.');
  }
}

// 2. Verificar diretamente em dist
if (!staticFilesFound && fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('index.html encontrado diretamente em dist. Copiando arquivos para public...');
  
  // Listar arquivos em dist, excluindo os que são claramente parte do servidor
  const distFiles = fs.readdirSync(distDir).filter(file => 
    file !== 'index.js' && 
    !file.endsWith('.mjs') && 
    !file.endsWith('.cjs') &&
    file !== 'server'
  );
  
  // Copiar cada arquivo/diretório para public
  for (const file of distFiles) {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(publicDir, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      // Se for diretório, copiar recursivamente
      exec(`mkdir -p ${destPath}`);
      exec(`cp -r ${srcPath}/* ${destPath}/`);
    } else {
      // Se for arquivo, copiar diretamente
      fs.copyFileSync(srcPath, destPath);
    }
  }
  
  staticFilesFound = true;
}

// 3. Como último recurso, tentar encontrar em /app/dist/client (caminho na Heroku)
if (!staticFilesFound && process.env.HEROKU === 'true' && fs.existsSync('/app/dist/client')) {
  console.log('Tentando encontrar arquivos estáticos no caminho /app/dist/client...');
  
  if (fs.existsSync(path.join('/app/dist/client', 'index.html'))) {
    console.log('index.html encontrado em /app/dist/client. Copiando para public...');
    exec(`cp -r /app/dist/client/* ${publicDir}/`);
    staticFilesFound = true;
  }
}

// 4. Verificar em src/client/index.html
if (!staticFilesFound && fs.existsSync(path.join(rootDir, 'client/index.html'))) {
  console.log('Encontrado client/index.html. Copiando para public...');
  exec(`cp -r ${path.join(rootDir, 'client')}/* ${publicDir}/`);
  staticFilesFound = true;
}

// 5. Reconstruir manualmente o projeto na pasta client e copiar o resultado
if (!staticFilesFound && fs.existsSync(path.join(rootDir, 'client'))) {
  console.log('Tentando reconstruir o frontend manualmente...');
  
  // Navegar para o diretório client
  process.chdir(path.join(rootDir, 'client'));
  
  // Executar build
  if (exec('npm run build')) {
    console.log('Build do frontend concluído. Verificando resultado...');
    
    // Verificar se o build gerou arquivos estáticos
    const buildDir = path.join(rootDir, 'client/dist');
    if (fs.existsSync(buildDir) && fs.existsSync(path.join(buildDir, 'index.html'))) {
      console.log('Copiando arquivos do build manual para public...');
      exec(`cp -r ${buildDir}/* ${publicDir}/`);
      staticFilesFound = true;
    }
  }
  
  // Voltar para o diretório raiz
  process.chdir(rootDir);
}

// Verificar resultado
if (staticFilesFound) {
  console.log('Arquivos estáticos foram copiados com sucesso para o diretório public.');
  
  // Verificar conteúdo do diretório public
  const publicFiles = fs.readdirSync(publicDir);
  console.log(`Diretório public contém ${publicFiles.length} arquivos:`);
  console.log(publicFiles.join(', '));
  
  if (publicFiles.includes('index.html')) {
    console.log('✅ index.html encontrado em public/. Tudo parece estar correto!');
  } else {
    console.error('❌ index.html não encontrado em public/ após a cópia. Algo deu errado.');
  }
} else {
  console.error('❌ Não foi possível encontrar arquivos estáticos em nenhum local conhecido.');
  console.error('A interface web pode não funcionar corretamente.');
}

console.log('Processo de cópia de arquivos estáticos concluído.');