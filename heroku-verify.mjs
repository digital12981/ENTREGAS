#!/usr/bin/env node

/**
 * Script de verificação de ambiente para a Heroku
 * Este script verifica o ambiente e fornece informações diagnósticas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração de caminhos para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

console.log('🔍 Verificando ambiente Heroku...');
console.log(`📌 Diretório atual: ${rootDir}`);
console.log(`📌 Versão do Node: ${process.version}`);
console.log(`📌 Timestamp: ${new Date().toISOString()}`);

// Verificar variáveis de ambiente
console.log('\n🌐 Variáveis de ambiente:');
const envVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'FOR4PAYMENTS_SECRET_KEY'
];

envVars.forEach(varName => {
  const exists = process.env[varName] ? 'configurada' : 'não configurada';
  console.log(`- ${varName}: ${exists}`);
});

// Verificar arquivos e diretórios importantes
console.log('\n📁 Verificando diretórios importantes:');
const dirsToCheck = [
  '',
  'client',
  'server',
  'public',
  'dist',
  'dist/public',
  'dist/client',
  'dist/server'
];

dirsToCheck.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  const exists = fs.existsSync(dirPath);
  const isDir = exists ? fs.statSync(dirPath).isDirectory() : false;
  
  if (exists && isDir) {
    console.log(`✅ ${dir || 'raiz'}: existe e é um diretório`);
  } else if (exists) {
    console.log(`⚠️ ${dir}: existe mas NÃO é um diretório`);
  } else {
    console.log(`❌ ${dir}: não existe`);
  }
});

// Verificar arquivos essenciais
console.log('\n📄 Verificando arquivos essenciais:');
const filesToCheck = [
  'package.json',
  'tsconfig.json',
  'Procfile',
  'client/index.html',
  'public/index.html',
  'dist/public/index.html',
  'dist/client/index.html'
];

filesToCheck.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      const size = stats.size;
      const mtime = stats.mtime;
      
      console.log(`✅ ${file}: existe (${size} bytes, modificado em ${mtime.toISOString()})`);
      
      // Para arquivos de index.html, verificar o conteúdo
      if (file.endsWith('index.html')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          console.log(`  - Primeiras 100 caracteres: ${content.substring(0, 100).replace(/\\n/g, ' ')}`);
          
          // Verificar tags script e link
          const scriptMatches = content.match(/<script[^>]*src="[^"]*"[^>]*>/g);
          if (scriptMatches) {
            console.log(`  - Tags script: ${scriptMatches.length}`);
            scriptMatches.slice(0, 3).forEach(m => console.log(`    ${m}`));
          } else {
            console.log('  - Nenhuma tag script encontrada');
          }
          
          const linkMatches = content.match(/<link[^>]*href="[^"]*"[^>]*>/g);
          if (linkMatches) {
            console.log(`  - Tags link: ${linkMatches.length}`);
            linkMatches.slice(0, 3).forEach(m => console.log(`    ${m}`));
          } else {
            console.log('  - Nenhuma tag link encontrada');
          }
        } catch (err) {
          console.error(`  - Erro ao ler conteúdo: ${err.message}`);
        }
      }
    } catch (err) {
      console.error(`❌ ${file}: erro ao obter informações: ${err.message}`);
    }
  } else {
    console.log(`❌ ${file}: não existe`);
  }
});

// Verificar diretórios de assets
console.log('\n🎨 Verificando diretórios de assets:');
const assetsDirsToCheck = [
  'public/assets',
  'dist/public/assets',
  'dist/client/assets'
];

assetsDirsToCheck.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    try {
      const files = fs.readdirSync(dirPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      const cssFiles = files.filter(f => f.endsWith('.css'));
      
      console.log(`✅ ${dir}: existe (${files.length} arquivos)`);
      console.log(`  - ${jsFiles.length} arquivos JS, ${cssFiles.length} arquivos CSS`);
      
      if (jsFiles.length > 0) {
        console.log(`  - JS: ${jsFiles.slice(0, 3).join(', ')}${jsFiles.length > 3 ? '...' : ''}`);
      }
      
      if (cssFiles.length > 0) {
        console.log(`  - CSS: ${cssFiles.slice(0, 3).join(', ')}${cssFiles.length > 3 ? '...' : ''}`);
      }
    } catch (err) {
      console.error(`❌ ${dir}: erro ao listar arquivos: ${err.message}`);
    }
  } else {
    console.log(`❌ ${dir}: não existe ou não é um diretório`);
  }
});

// Verificar scripts disponíveis
console.log('\n🛠️ Verificando scripts disponíveis:');
const scriptsToCheck = [
  'fix-static-paths.mjs',
  'copy-static-files.mjs',
  'rebuild-static.mjs',
  'heroku-start.mjs',
  'heroku-postbuild.mjs'
];

scriptsToCheck.forEach(script => {
  const scriptPath = path.join(rootDir, script);
  if (fs.existsSync(scriptPath)) {
    try {
      const stats = fs.statSync(scriptPath);
      const size = stats.size;
      const executable = (stats.mode & 0o111) !== 0; // Verifica se o bit de execução está definido
      
      console.log(`✅ ${script}: existe (${size} bytes, ${executable ? 'executável' : 'não executável'})`);
    } catch (err) {
      console.error(`❌ ${script}: erro ao obter informações: ${err.message}`);
    }
  } else {
    console.log(`❌ ${script}: não existe`);
  }
});

// Resumo
console.log('\n📊 Resumo:');
console.log('✅ Verificação de ambiente concluída');
console.log('✅ Informações disponíveis para diagnóstico');

console.log('\n🚀 Pronto para continuar o processo de implantação!');