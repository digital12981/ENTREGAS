#!/usr/bin/env node

/**
 * Script para copiar arquivos estáticos para todos os diretórios possíveis
 * 
 * Este script verifica e copia arquivos estáticos necessários para todos os diretórios
 * onde eles podem ser servidos, garantindo que estejam acessíveis independentemente
 * do caminho que o Express use para servi-los.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

console.log('📋 Iniciando cópia de arquivos estáticos...');

// Lista de diretórios onde os arquivos estáticos devem existir
const directories = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'dist', 'public'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'dist', 'server', 'public'),
  path.join(rootDir, 'src', 'public')
];

// Garantir que todos os diretórios existam
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Criado diretório: ${dir}`);
    } catch (err) {
      console.error(`Erro ao criar diretório ${dir}: ${err.message}`);
    }
  }
});

// Encontrar diretórios com arquivos importantes
function findFileSource(filename, directories) {
  for (const dir of directories) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  
  // Verificar em cliente/dist/assets
  const clientAssetsPath = path.join(rootDir, 'client', 'dist', 'assets', filename);
  if (fs.existsSync(clientAssetsPath)) {
    return clientAssetsPath;
  }
  
  // Não encontrado
  return null;
}

// Função para copiar um arquivo para todos os diretórios
function copyFileToAllDirectories(sourceFile, destFilename = null) {
  const filename = destFilename || path.basename(sourceFile);
  const sourceDir = path.dirname(sourceFile);
  
  let copyCount = 0;
  directories.forEach(dir => {
    if (dir !== sourceDir) {
      const targetPath = path.join(dir, filename);
      try {
        fs.copyFileSync(sourceFile, targetPath);
        console.log(`✅ Copiado ${filename} para ${dir}`);
        copyCount++;
      } catch (err) {
        console.error(`❌ Erro ao copiar para ${targetPath}: ${err.message}`);
      }
    }
  });
  
  return copyCount;
}

// Função para copiar todo o conteúdo de um diretório para outros diretórios
function copyDirectoryContents(sourceDir, targetSubDir = '') {
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    console.warn(`⚠️ Diretório fonte não encontrado ou não é um diretório: ${sourceDir}`);
    return 0;
  }
  
  const files = fs.readdirSync(sourceDir);
  let copyCount = 0;
  
  // Para cada diretório de destino
  directories.forEach(targetBaseDir => {
    if (targetBaseDir === sourceDir) return; // Pular o diretório fonte
    
    // Criar o subdiretório de destino se necessário
    const fullTargetDir = path.join(targetBaseDir, targetSubDir);
    if (!fs.existsSync(fullTargetDir)) {
      try {
        fs.mkdirSync(fullTargetDir, { recursive: true });
      } catch (err) {
        console.error(`Erro ao criar diretório ${fullTargetDir}: ${err.message}`);
        return;
      }
    }
    
    // Copiar cada arquivo
    files.forEach(file => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(fullTargetDir, file);
      
      // Verificar se é um arquivo ou diretório
      if (fs.statSync(sourcePath).isDirectory()) {
        // Criar subdiretório recursivamente
        const newSubDir = targetSubDir ? path.join(targetSubDir, file) : file;
        const newSourceDir = path.join(sourceDir, file);
        copyCount += copyDirectoryContents(newSourceDir, newSubDir);
      } else {
        // Copiar arquivo
        try {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`Copiado ${file} para ${fullTargetDir}`);
          copyCount++;
        } catch (err) {
          console.error(`Erro ao copiar ${file}: ${err.message}`);
        }
      }
    });
  });
  
  return copyCount;
}

// Verificar e copiar os arquivos importantes
console.log('🔍 Procurando arquivos importantes...');

// 1. Procurar e copiar index.html
const indexHtmlSource = findFileSource('index.html', directories);
if (indexHtmlSource) {
  console.log(`✅ Encontrado index.html em ${indexHtmlSource}`);
  const copiedCount = copyFileToAllDirectories(indexHtmlSource);
  console.log(`Copiado index.html para ${copiedCount} diretórios`);
} else {
  // Verificar em client/index.html
  const clientIndexPath = path.join(rootDir, 'client', 'index.html');
  if (fs.existsSync(clientIndexPath)) {
    console.log(`✅ Encontrado index.html em ${clientIndexPath}`);
    const copiedCount = copyFileToAllDirectories(clientIndexPath);
    console.log(`Copiado index.html para ${copiedCount} diretórios`);
  } else {
    console.error('❌ Não foi possível encontrar index.html em nenhum diretório!');
  }
}

// 2. Procurar e copiar favicon.ico
const faviconSource = findFileSource('favicon.ico', directories);
if (faviconSource) {
  console.log(`✅ Encontrado favicon.ico em ${faviconSource}`);
  const copiedCount = copyFileToAllDirectories(faviconSource);
  console.log(`Copiado favicon.ico para ${copiedCount} diretórios`);
} else {
  // Usar o favicon gerado, se existir
  const generatedIconPath = path.join(rootDir, 'generated-icon.png');
  if (fs.existsSync(generatedIconPath)) {
    console.log(`✅ Usando ícone gerado: ${generatedIconPath}`);
    const copiedCount = copyFileToAllDirectories(generatedIconPath, 'favicon.ico');
    console.log(`Copiado favicon.ico para ${copiedCount} diretórios`);
  } else {
    console.warn('⚠️ Não foi possível encontrar favicon.ico em nenhum diretório.');
  }
}

// 3. Verificar e copiar diretorios de assets
console.log('🔍 Verificando diretórios de assets...');

// Lista de possíveis diretórios de assets
const possibleAssetsDirs = [
  path.join(rootDir, 'dist', 'client', 'assets'),
  path.join(rootDir, 'public', 'assets'),
  path.join(rootDir, 'dist', 'public', 'assets'),
  path.join(rootDir, 'client', 'dist', 'assets')
];

// Encontrar diretórios de assets existentes
const existingAssetsDirs = possibleAssetsDirs.filter(dir => fs.existsSync(dir));

if (existingAssetsDirs.length > 0) {
  console.log(`✅ Encontrados ${existingAssetsDirs.length} diretórios de assets`);
  
  // Usar o primeiro diretório como fonte
  const sourceAssetsDir = existingAssetsDirs[0];
  console.log(`Usando ${sourceAssetsDir} como fonte para assets`);
  
  // Garantir que todos os diretórios tenham um subdiretório assets
  directories.forEach(dir => {
    const assetsDir = path.join(dir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      try {
        fs.mkdirSync(assetsDir, { recursive: true });
        console.log(`Criado diretório de assets em ${dir}`);
      } catch (err) {
        console.error(`Erro ao criar diretório de assets em ${dir}: ${err.message}`);
      }
    }
  });
  
  // Copiar conteúdo do diretório de assets para todos os outros
  console.log('Copiando arquivos de assets para todos os diretórios...');
  const copiedCount = copyDirectoryContents(sourceAssetsDir, 'assets');
  console.log(`Copiados ${copiedCount} arquivos de assets`);
} else {
  console.warn('⚠️ Nenhum diretório de assets encontrado!');
}

console.log('\n📋 Resumo:');
console.log(`- Diretórios verificados: ${directories.length}`);
console.log(`- Diretórios de assets encontrados: ${existingAssetsDirs.length}`);

if (indexHtmlSource || faviconSource || existingAssetsDirs.length > 0) {
  console.log('✅ Processo de cópia concluído com sucesso!');
} else {
  console.warn('⚠️ Nenhum arquivo importante foi encontrado para copiar.');
}

console.log('\n🚀 Arquivos estáticos preparados para implantação!');