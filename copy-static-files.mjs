#!/usr/bin/env node

/**
 * Script para copiar arquivos estáticos entre diretórios
 * 
 * Este script garante que todos os arquivos estáticos necessários
 * estejam presentes em todos os diretórios possíveis que o servidor
 * possa procurar por eles.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

console.log('🔍 Localizando e copiando arquivos estáticos...');

// Lista de diretórios onde arquivos estáticos podem estar
const staticDirs = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'dist', 'public'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'static'),
  path.join(rootDir, 'client', 'static'),
  path.join(rootDir, 'client', 'dist')
];

// Garantir que todos os diretórios existam
staticDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Criado diretório: ${dir}`);
    } catch (err) {
      console.error(`Erro ao criar diretório ${dir}: ${err.message}`);
    }
  }
});

// Verificar quais diretórios têm conteúdo
const populatedDirs = staticDirs.filter(dir => {
  if (fs.existsSync(dir)) {
    try {
      const files = fs.readdirSync(dir);
      return files.length > 0;
    } catch (err) {
      return false;
    }
  }
  return false;
});

console.log(`Encontrados ${populatedDirs.length} diretórios com arquivos estáticos`);

// Encontrar o diretório mais completo para usar como fonte
let bestSourceDir = null;
let maxFileCount = -1;

populatedDirs.forEach(dir => {
  try {
    const files = fs.readdirSync(dir);
    const hasIndex = files.includes('index.html');
    const hasAssets = files.includes('assets');
    
    let fileCount = files.length;
    // Dar prioridade a diretórios com index.html e assets
    if (hasIndex) fileCount += 5;
    if (hasAssets) fileCount += 10;
    
    if (fileCount > maxFileCount) {
      maxFileCount = fileCount;
      bestSourceDir = dir;
    }
  } catch (err) {
    console.error(`Erro ao ler diretório ${dir}: ${err.message}`);
  }
});

if (!bestSourceDir) {
  console.log('Nenhum diretório com arquivos encontrado. Verificando cliente...');
  
  // Verificar se existe diretório client e tem um index.html
  const clientDir = path.join(rootDir, 'client');
  const clientIndexPath = path.join(clientDir, 'index.html');
  
  if (fs.existsSync(clientIndexPath)) {
    bestSourceDir = clientDir;
  }
}

if (!bestSourceDir) {
  console.error('Não foi possível encontrar uma fonte para copiar arquivos estáticos');
  process.exit(1);
}

console.log(`Usando ${bestSourceDir} como fonte para copiar arquivos estáticos`);

// Função para copiar um arquivo ou diretório recursivamente
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    try {
      fs.copyFileSync(src, dest);
    } catch (err) {
      console.error(`Erro ao copiar arquivo ${src} para ${dest}: ${err.message}`);
    }
  }
}

// Copiar arquivo index.html para todos os diretórios
const srcIndexPath = path.join(bestSourceDir, 'index.html');
if (fs.existsSync(srcIndexPath)) {
  staticDirs.forEach(dir => {
    if (dir !== bestSourceDir) {
      const destIndexPath = path.join(dir, 'index.html');
      try {
        fs.copyFileSync(srcIndexPath, destIndexPath);
        console.log(`Copiado index.html para ${dir}`);
      } catch (err) {
        console.error(`Erro ao copiar index.html para ${dir}: ${err.message}`);
      }
    }
  });
}

// Copiar pasta assets para todos os diretórios se existir
const srcAssetsPath = path.join(bestSourceDir, 'assets');
if (fs.existsSync(srcAssetsPath)) {
  staticDirs.forEach(dir => {
    if (dir !== bestSourceDir) {
      const destAssetsPath = path.join(dir, 'assets');
      
      // Criar diretório assets se não existir
      if (!fs.existsSync(destAssetsPath)) {
        try {
          fs.mkdirSync(destAssetsPath, { recursive: true });
        } catch (err) {
          console.error(`Erro ao criar diretório ${destAssetsPath}: ${err.message}`);
          return; // Pular para o próximo diretório se não conseguir criar
        }
      }
      
      // Copiar todos os arquivos de assets
      try {
        copyRecursive(srcAssetsPath, destAssetsPath);
        console.log(`Copiados arquivos de assets para ${dir}`);
      } catch (err) {
        console.error(`Erro ao copiar assets para ${dir}: ${err.message}`);
      }
    }
  });
} else {
  console.log('Diretório assets não encontrado na fonte');
}

// Verificar todos os diretórios de assets e copiar arquivos entre eles
const assetsDirs = staticDirs
  .map(dir => path.join(dir, 'assets'))
  .filter(dir => fs.existsSync(dir));

// Função para listar JS e CSS em um diretório
function listJsAndCss(dir) {
  try {
    const files = fs.readdirSync(dir);
    const js = files.filter(f => f.endsWith('.js'));
    const css = files.filter(f => f.endsWith('.css'));
    return { js, css };
  } catch (err) {
    return { js: [], css: [] };
  }
}

// Verificar assets em cada diretório
console.log('\n📋 Verificando resultado');
for (const dir of staticDirs) {
  if (fs.existsSync(dir)) {
    try {
      const files = fs.readdirSync(dir);
      console.log(`Diretório ${path.relative(rootDir, dir)}/ contém ${files.length} arquivos/diretórios:`);
      console.log(files.join(', '));
      
      if (files.includes('index.html')) {
        console.log(`✅ index.html encontrado em ${path.relative(rootDir, dir)}/`);
      }
      
      if (files.includes('assets')) {
        const assetsPath = path.join(dir, 'assets');
        const { js, css } = listJsAndCss(assetsPath);
        
        if (js.length > 0 || css.length > 0) {
          console.log(`✅ Arquivos de assets encontrados`);
          if (js.length > 0) console.log(`  - ${js.length} arquivos JS: ${js.join(', ')}`);
          if (css.length > 0) console.log(`  - ${css.length} arquivos CSS: ${css.join(', ')}`);
        }
      }
      
      console.log('');
    } catch (err) {
      console.error(`Erro ao listar conteúdo de ${dir}: ${err.message}`);
    }
  }
}

console.log('📋 Cópia de arquivos estáticos concluída.');