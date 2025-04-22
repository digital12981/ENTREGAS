#!/usr/bin/env node

/**
 * Script para reconstruir a estrutura de arquivos estáticos
 * 
 * Este script verifica e reconstrói os diretórios e arquivos estáticos
 * necessários para a aplicação funcionar corretamente no ambiente de produção.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

console.log('🔄 Reconstruindo estrutura de arquivos estáticos...');

// Lista de diretórios que devem existir
const requiredDirs = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'dist'),
  path.join(rootDir, 'dist', 'public'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'public', 'assets'),
  path.join(rootDir, 'dist', 'public', 'assets'),
  path.join(rootDir, 'dist', 'client', 'assets')
];

// Garantir que todos os diretórios existam
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Criando diretório ${dir}...`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Função para copiar arquivos entre diretórios
function copyFileIfExists(source, dest) {
  if (fs.existsSync(source)) {
    try {
      fs.copyFileSync(source, dest);
      console.log(`Arquivo copiado: ${path.basename(source)} -> ${path.relative(rootDir, dest)}`);
      return true;
    } catch (error) {
      console.error(`Erro ao copiar ${source} para ${dest}: ${error.message}`);
      return false;
    }
  }
  return false;
}

// Verificar index.html em client/index.html e copiar para outros diretórios
const clientIndexHtml = path.join(rootDir, 'client', 'index.html');
if (fs.existsSync(clientIndexHtml)) {
  console.log(`Encontrado index.html em ${clientIndexHtml}`);
  
  // Copiar para diretórios de produção
  const destDirs = [
    path.join(rootDir, 'public'),
    path.join(rootDir, 'dist', 'public'),
    path.join(rootDir, 'dist', 'client')
  ];
  
  destDirs.forEach(dir => {
    const destFile = path.join(dir, 'index.html');
    copyFileIfExists(clientIndexHtml, destFile);
  });
} else {
  console.warn('⚠️ Não foi encontrado index.html em client/index.html');
}

// Verificar assets em client/dist/assets e copiar para outros diretórios
const clientDistAssets = path.join(rootDir, 'client', 'dist', 'assets');
if (fs.existsSync(clientDistAssets) && fs.statSync(clientDistAssets).isDirectory()) {
  console.log(`Encontrado diretório de assets em ${clientDistAssets}`);
  
  try {
    const files = fs.readdirSync(clientDistAssets);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    
    console.log(`Encontrados ${jsFiles.length} arquivos JS e ${cssFiles.length} arquivos CSS`);
    
    // Diretórios de destino para os assets
    const destAssetsDirs = [
      path.join(rootDir, 'public', 'assets'),
      path.join(rootDir, 'dist', 'public', 'assets'),
      path.join(rootDir, 'dist', 'client', 'assets')
    ];
    
    // Copiar todos os arquivos para cada diretório de destino
    destAssetsDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      files.forEach(file => {
        const srcFile = path.join(clientDistAssets, file);
        const destFile = path.join(dir, file);
        copyFileIfExists(srcFile, destFile);
      });
    });
  } catch (err) {
    console.error(`Erro ao copiar assets: ${err.message}`);
  }
} else {
  console.log('Diretório client/dist/assets não encontrado.');
  
  // Tentar executar o build para criar os assets
  if (fs.existsSync(path.join(rootDir, 'client'))) {
    console.log('Tentando executar o build para criar os assets...');
    
    try {
      const originalDir = process.cwd();
      process.chdir(rootDir);
      
      // Forçar apenas build do cliente
      execSync('npm run build:client', { stdio: 'inherit' });
      
      // Voltar para o diretório original
      process.chdir(originalDir);
      
      console.log('Build concluído com sucesso.');
    } catch (err) {
      console.error(`Erro ao executar build: ${err.message}`);
    }
  }
}

// Criar favicon.ico se não existir
const faviconPaths = [
  path.join(rootDir, 'public', 'favicon.ico'),
  path.join(rootDir, 'dist', 'public', 'favicon.ico'),
  path.join(rootDir, 'dist', 'client', 'favicon.ico')
];

// Verificar se já existe favicon em algum dos diretórios
let foundFavicon = false;
for (const faviconPath of faviconPaths) {
  if (fs.existsSync(faviconPath)) {
    foundFavicon = true;
    
    // Copiar para outros diretórios
    faviconPaths.forEach(destPath => {
      if (destPath !== faviconPath) {
        copyFileIfExists(faviconPath, destPath);
      }
    });
    
    break;
  }
}

// Se não encontrou favicon, tentar criar um básico
if (!foundFavicon) {
  console.log('Favicon não encontrado. Verificando ícone gerado...');
  
  const generatedIcon = path.join(rootDir, 'generated-icon.png');
  if (fs.existsSync(generatedIcon)) {
    console.log('Usando ícone gerado como favicon...');
    
    faviconPaths.forEach(destPath => {
      copyFileIfExists(generatedIcon, destPath);
    });
  } else {
    console.warn('⚠️ Não foi possível encontrar favicon ou ícone gerado.');
  }
}

// Verificar se existe algum diretório client/static e copiar seu conteúdo
const clientStatic = path.join(rootDir, 'client', 'static');
if (fs.existsSync(clientStatic) && fs.statSync(clientStatic).isDirectory()) {
  console.log(`Encontrado diretório estático em ${clientStatic}`);
  
  try {
    const files = fs.readdirSync(clientStatic);
    console.log(`Encontrados ${files.length} arquivos estáticos`);
    
    // Diretórios de destino para arquivos estáticos
    const destDirs = [
      path.join(rootDir, 'public'),
      path.join(rootDir, 'dist', 'public'),
      path.join(rootDir, 'dist', 'client')
    ];
    
    // Copiar todos os arquivos para cada diretório de destino
    destDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      files.forEach(file => {
        const srcFile = path.join(clientStatic, file);
        const destFile = path.join(dir, file);
        
        // Se for um arquivo (não um diretório)
        if (fs.statSync(srcFile).isFile()) {
          copyFileIfExists(srcFile, destFile);
        }
      });
    });
  } catch (err) {
    console.error(`Erro ao copiar arquivos estáticos: ${err.message}`);
  }
}

console.log('✅ Reconstrução de arquivos estáticos concluída!');