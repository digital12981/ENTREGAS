#!/usr/bin/env node

/**
 * Script de post-build para a Heroku
 * Este script é executado após o build e antes da inicialização do servidor
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração de caminhos para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Executando script de post-build da Heroku...');
console.log('🔵 Versão do Node:', process.version);
console.log('🕒 Timestamp:', new Date().toISOString());

// Função para executar um comando e exibir o log
function execCommand(command) {
  console.log(`Executando: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Comando falhou: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// 1. Instalação do Python e dependências
console.log('📦 Instalando dependências Python...');
execCommand('pip install -r heroku-requirements.txt');

// 2. Construir o aplicativo Node.js
console.log('🏗️ Construindo aplicação Node.js...');
execCommand('npm run build');

// 3. Verificar se o build foi bem-sucedido
const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ FATAL: Diretório dist não encontrado após o build!');
  process.exit(1);
}

// 4. Executar o script de correção de caminhos estáticos
console.log('🔧 Executando script de correção de caminhos estáticos...');
try {
  // Primeiro tentar usar o novo script
  execCommand('node fix-static-paths.mjs');
} catch (err) {
  console.warn('⚠️ Erro ao executar fix-static-paths.mjs, tentando script alternativo...');
  try {
    // Se falhar, usar o script existente
    execCommand('node fixup-static-dirs.js');
  } catch (err2) {
    console.error('❌ Ambos os scripts de correção falharam. Tentando continuar...');
  }
}

// 5. Executar o script de cópia de arquivos estáticos
console.log('📋 Executando script de cópia de arquivos estáticos...');
try {
  execCommand('node copy-static-files.mjs');
} catch (err) {
  console.warn('⚠️ Erro ao executar copy-static-files.mjs. Tentando continuar...');
}

// 6. Verificar permissões de arquivos importantes
console.log('🔒 Verificando permissões de arquivos...');
const filesToMakeExecutable = [
  'production-loader.js',
  'production-loader.mjs',
  'fixup-static-dirs.js',
  'fix-static-paths.mjs',
  'copy-static-files.mjs',
  'heroku-start.mjs'
];

filesToMakeExecutable.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      execCommand(`chmod +x ${file}`);
    } catch (err) {
      console.warn(`⚠️ Não foi possível definir permissão de execução para ${file}`);
    }
  }
});

// 7. Exibir estrutura de diretórios para debug
console.log('📁 Estrutura de diretórios:');
execCommand('find . -type d -maxdepth 3 -not -path "*/node_modules/*" -not -path "*/.git/*" | sort');

// 8. Verificar conteúdo do diretório public e outros diretórios importantes
const dirsToCheck = [
  path.resolve(process.cwd(), 'public'),
  path.resolve(process.cwd(), 'dist', 'public'),
  path.resolve(process.cwd(), 'dist', 'client')
];

dirsToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Arquivos em ${path.relative(process.cwd(), dir)}:`);
    execCommand(`find "${dir}" -type f -maxdepth 2 | sort`);
    
    // Verificar se index.html existe
    if (fs.existsSync(path.join(dir, 'index.html'))) {
      console.log(`✅ SUCESSO: index.html encontrado em ${path.relative(process.cwd(), dir)}!`);
    } else {
      console.warn(`⚠️ AVISO: index.html não encontrado em ${path.relative(process.cwd(), dir)}!`);
    }
    
    // Verificar se assets/index.js existe (compilado pelo Vite)
    const assetsDir = path.join(dir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const hasIndexJs = fs.existsSync(path.join(assetsDir, 'index.js'));
      const hasIndexCss = fs.existsSync(path.join(assetsDir, 'index.css'));
      
      if (hasIndexJs) {
        console.log(`✅ SUCESSO: assets/index.js encontrado em ${path.relative(process.cwd(), dir)}!`);
      } else {
        console.warn(`⚠️ AVISO: assets/index.js não encontrado em ${path.relative(process.cwd(), dir)}!`);
      }
      
      if (hasIndexCss) {
        console.log(`✅ SUCESSO: assets/index.css encontrado em ${path.relative(process.cwd(), dir)}!`);
      }
    } else {
      console.warn(`⚠️ AVISO: diretório assets não encontrado em ${path.relative(process.cwd(), dir)}!`);
    }
  }
});

// 9. Imprimir resumo
console.log('\n📋 Resumo do post-build:');
console.log('✅ Build da aplicação concluído');
console.log('✅ Scripts de correção executados');
console.log('✅ Permissões de arquivos verificadas');
console.log('✅ Estrutura de diretórios exibida');

console.log('\n🎉 Script de post-build da Heroku concluído com sucesso!\n');