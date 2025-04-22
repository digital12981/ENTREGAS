#!/usr/bin/env node

/**
 * Script de verificação de ambiente Heroku
 * 
 * Este script verifica se o ambiente de produção está corretamente configurado
 * e reporta informações úteis para diagnóstico.
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
[
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'FOR4PAYMENTS_SECRET_KEY',
  'FOR4PAYMENTS_API_URL'
].forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`- ${envVar}: configurada`);
  } else {
    console.log(`- ${envVar}: não configurada`);
  }
});

// Verificar diretórios importantes
console.log('\n📁 Verificando diretórios importantes:');
const dirsToCheck = [
  { path: rootDir, name: 'raiz' },
  { path: path.join(rootDir, 'client'), name: 'client' },
  { path: path.join(rootDir, 'server'), name: 'server' },
  { path: path.join(rootDir, 'public'), name: 'public' },
  { path: path.join(rootDir, 'dist'), name: 'dist' },
  { path: path.join(rootDir, 'dist', 'public'), name: 'dist/public' },
  { path: path.join(rootDir, 'dist', 'client'), name: 'dist/client' },
  { path: path.join(rootDir, 'dist', 'server'), name: 'dist/server' }
];

dirsToCheck.forEach(dir => {
  if (fs.existsSync(dir.path)) {
    if (fs.statSync(dir.path).isDirectory()) {
      console.log(`✅ ${dir.name}: existe e é um diretório`);
    } else {
      console.log(`❌ ${dir.name}: existe mas não é um diretório`);
    }
  } else {
    console.log(`❌ ${dir.name}: não existe`);
  }
});

// Verificar arquivos essenciais
console.log('\n📄 Verificando arquivos essenciais:');
const filesToCheck = [
  { path: path.join(rootDir, 'package.json'), name: 'package.json' },
  { path: path.join(rootDir, 'tsconfig.json'), name: 'tsconfig.json' },
  { path: path.join(rootDir, 'Procfile'), name: 'Procfile' },
  { path: path.join(rootDir, 'client', 'index.html'), name: 'client/index.html' },
  { path: path.join(rootDir, 'public', 'index.html'), name: 'public/index.html' },
  { path: path.join(rootDir, 'dist', 'public', 'index.html'), name: 'dist/public/index.html' },
  { path: path.join(rootDir, 'dist', 'client', 'index.html'), name: 'dist/client/index.html' }
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file.path)) {
    try {
      const stats = fs.statSync(file.path);
      console.log(`✅ ${file.name}: existe (${stats.size} bytes, modificado em ${stats.mtime.toISOString()})`);
      
      // Para arquivos HTML, mostrar mais informações
      if (file.path.endsWith('index.html')) {
        const content = fs.readFileSync(file.path, 'utf8');
        console.log(`  - Primeiras 100 caracteres: ${content.substr(0, 100)}`);
        
        // Contar scripts e links
        const scriptMatches = content.match(/<script[^>]*>/g) || [];
        const linkMatches = content.match(/<link[^>]*>/g) || [];
        
        console.log(`  - Tags script: ${scriptMatches.length}`);
        scriptMatches.slice(0, 3).forEach(script => {
          console.log(`    ${script.substr(0, 80)}${script.length > 80 ? '...' : ''}`);
        });
        
        console.log(`  - Tags link: ${linkMatches.length}`);
        linkMatches.slice(0, 3).forEach(link => {
          console.log(`    ${link.substr(0, 80)}${link.length > 80 ? '...' : ''}`);
        });
      }
    } catch (err) {
      console.log(`❌ ${file.name}: erro ao acessar - ${err.message}`);
    }
  } else {
    console.log(`❌ ${file.name}: não existe`);
  }
});

// Verificar diretórios de assets
console.log('\n🎨 Verificando diretórios de assets:');
const assetsDirs = [
  { path: path.join(rootDir, 'public', 'assets'), name: 'public/assets' },
  { path: path.join(rootDir, 'dist', 'public', 'assets'), name: 'dist/public/assets' },
  { path: path.join(rootDir, 'dist', 'client', 'assets'), name: 'dist/client/assets' }
];

assetsDirs.forEach(dir => {
  if (fs.existsSync(dir.path) && fs.statSync(dir.path).isDirectory()) {
    try {
      const files = fs.readdirSync(dir.path);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      const cssFiles = files.filter(f => f.endsWith('.css'));
      
      console.log(`✅ ${dir.name}: existe (${files.length} arquivos)`);
      console.log(`  - ${jsFiles.length} arquivos JS, ${cssFiles.length} arquivos CSS`);
      
      if (jsFiles.length > 0) {
        console.log(`  - JS: ${jsFiles.join(', ')}`);
      }
      
      if (cssFiles.length > 0) {
        console.log(`  - CSS: ${cssFiles.join(', ')}`);
      }
    } catch (err) {
      console.log(`❌ ${dir.name}: erro ao listar - ${err.message}`);
    }
  } else {
    console.log(`❌ ${dir.name}: não existe ou não é um diretório`);
  }
});

// Verificar scripts personalizados
console.log('\n🛠️ Verificando scripts disponíveis:');
const scriptsToCheck = [
  { path: path.join(rootDir, 'fix-static-paths.mjs'), name: 'fix-static-paths.mjs' },
  { path: path.join(rootDir, 'copy-static-files.mjs'), name: 'copy-static-files.mjs' },
  { path: path.join(rootDir, 'rebuild-static.mjs'), name: 'rebuild-static.mjs' },
  { path: path.join(rootDir, 'heroku-start.mjs'), name: 'heroku-start.mjs' },
  { path: path.join(rootDir, 'heroku-postbuild.mjs'), name: 'heroku-postbuild.mjs' },
  { path: path.join(rootDir, 'build-server.mjs'), name: 'build-server.mjs' },
  { path: path.join(rootDir, 'update-vite-html.mjs'), name: 'update-vite-html.mjs' }
];

scriptsToCheck.forEach(script => {
  if (fs.existsSync(script.path)) {
    try {
      const stats = fs.statSync(script.path);
      const executable = (stats.mode & fs.constants.S_IXUSR) !== 0;
      console.log(`✅ ${script.name}: existe (${stats.size} bytes, ${executable ? 'executável' : 'não executável'})`);
      
      // Se não for executável, torná-lo executável
      if (!executable) {
        try {
          fs.chmodSync(script.path, stats.mode | fs.constants.S_IXUSR);
          console.log(`  - Tornando ${script.name} executável...`);
        } catch (err) {
          console.log(`  - Erro ao tornar executável: ${err.message}`);
        }
      }
    } catch (err) {
      console.log(`❌ ${script.name}: erro ao acessar - ${err.message}`);
    }
  } else {
    console.log(`❌ ${script.name}: não existe`);
  }
});

// Resumo da verificação
console.log('\n📊 Resumo:');
console.log('✅ Verificação de ambiente concluída');
console.log('✅ Informações disponíveis para diagnóstico');
console.log('\n🚀 Pronto para continuar o processo de implantação!');

// Criar diretórios críticos se não existirem
[
  path.join(rootDir, 'public'),
  path.join(rootDir, 'public', 'assets'),
  path.join(rootDir, 'dist'),
  path.join(rootDir, 'dist', 'public'),
  path.join(rootDir, 'dist', 'public', 'assets'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'dist', 'client', 'assets'),
  path.join(rootDir, 'dist', 'server')
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Criado diretório crítico: ${dir}`);
    } catch (err) {
      console.error(`Erro ao criar diretório ${dir}: ${err.message}`);
    }
  }
});