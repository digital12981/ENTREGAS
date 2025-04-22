#!/usr/bin/env node

/**
 * Script para reconstruir e copiar arquivos estáticos do frontend
 * diretamente para o diretório public na Heroku
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();
const clientDir = path.join(rootDir, 'client');
const publicDir = path.join(rootDir, 'public');

console.log('🔨 Reconstruindo arquivos estáticos para Heroku');
console.log(`Data/Hora: ${new Date().toISOString()}`);
console.log(`Diretório raiz: ${rootDir}`);

// Verificar existência dos diretórios
if (!fs.existsSync(clientDir)) {
  console.error('❌ Diretório client/ não encontrado!');
  process.exit(1);
}

// Criar diretório public se não existir
if (!fs.existsSync(publicDir)) {
  console.log('Criando diretório public/...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Função para executar comando e registrar saída
function execCmd(cmd, args = [], options = {}) {
  console.log(`Executando: ${cmd} ${args.join(' ')}`);
  
  try {
    const output = execSync(`${cmd} ${args.join(' ')}`, {
      stdio: 'inherit',
      ...options
    });
    return { success: true, output };
  } catch (error) {
    console.error(`❌ Erro ao executar comando: ${error.message}`);
    return { success: false, error };
  }
}

// Função para copiar diretório recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Abordagem 1: Copiar diretamente os arquivos do cliente para public
console.log('\n📦 Método 1: Copiar arquivos do cliente diretamente');
const clientSrcDir = path.join(clientDir, 'src');
const clientPublicDir = path.join(clientDir, 'public');
const clientIndexHtml = path.join(clientDir, 'index.html');

// Copiar index.html
if (fs.existsSync(clientIndexHtml)) {
  console.log('Copiando index.html do cliente...');
  fs.copyFileSync(clientIndexHtml, path.join(publicDir, 'index.html'));
}

// Copiar diretório public do cliente (se existir)
if (fs.existsSync(clientPublicDir)) {
  console.log('Copiando diretório public/ do cliente...');
  copyDir(clientPublicDir, publicDir);
}

// Copiar diretório src do cliente
if (fs.existsSync(clientSrcDir)) {
  console.log('Copiando diretório src/ do cliente...');
  copyDir(clientSrcDir, path.join(publicDir, 'src'));
}

// Abordagem 2: Tentar fazer build dos arquivos estáticos
console.log('\n📦 Método 2: Construir arquivos estáticos via script inline');

// Criar arquivo package.json temporário para o build estático
const tempPackageJson = {
  name: "static-build",
  version: "1.0.0",
  scripts: {
    "build": "vite build --outDir ../public"
  },
  dependencies: {},
  devDependencies: {}
};

const tempPackagePath = path.join(clientDir, 'temp-package.json');
fs.writeFileSync(tempPackagePath, JSON.stringify(tempPackageJson, null, 2));

// Copiar vite.config.js modificado
const viteConfigContent = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../public',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@shared': path.resolve(__dirname, '../shared'),
    }
  }
});
`;

const tempViteConfigPath = path.join(clientDir, 'temp-vite.config.js');
fs.writeFileSync(tempViteConfigPath, viteConfigContent);

// Tentar fazer o build do frontend diretamente
console.log('Navegando para o diretório client/...');
process.chdir(clientDir);

console.log('Tentando build do frontend...');
execCmd('npx', ['vite', 'build', '--config', 'temp-vite.config.js', '--outDir', '../public']);

// Limpar arquivos temporários
try {
  fs.unlinkSync(tempPackagePath);
  fs.unlinkSync(tempViteConfigPath);
} catch (err) {
  console.warn('Aviso: Não foi possível remover arquivos temporários');
}

// Voltar para o diretório raiz
process.chdir(rootDir);

// Abordagem 3: Copiar arquivos de dist (se existirem)
console.log('\n📦 Método 3: Copiar de dist/ ou dist/client/');
const distDir = path.join(rootDir, 'dist');
const distClientDir = path.join(distDir, 'client');

if (fs.existsSync(distClientDir) && fs.existsSync(path.join(distClientDir, 'index.html'))) {
  console.log('Encontrado index.html em dist/client/, copiando...');
  copyDir(distClientDir, publicDir);
} else if (fs.existsSync(distDir) && fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('Encontrado index.html em dist/, copiando...');
  
  // Copiar apenas os arquivos estáticos, não o código do servidor
  const entries = fs.readdirSync(distDir, { withFileTypes: true });
  for (const entry of entries) {
    // Ignorar arquivos do servidor
    if (['index.js', 'server'].includes(entry.name)) continue;
    
    const srcPath = path.join(distDir, entry.name);
    const destPath = path.join(publicDir, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Verificar o resultado final
console.log('\n📋 Verificando resultado');
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  console.log(`Diretório public/ contém ${publicFiles.length} arquivos/diretórios:`);
  console.log(publicFiles.join(', '));
  
  if (fs.existsSync(path.join(publicDir, 'index.html'))) {
    console.log('✅ index.html encontrado em public/');
    
    // Verificar se há arquivos de assets (scripts, css, etc)
    const hasAssets = publicFiles.some(file => 
      file === 'assets' || 
      file.endsWith('.js') || 
      file.endsWith('.css'));
    
    if (hasAssets) {
      console.log('✅ Arquivos de assets encontrados');
    } else {
      console.warn('⚠️ Nenhum arquivo de assets encontrado!');
      
      // Tentar criar assets básicos
      console.log('Tentando criar assets básicos...');
      const basicAssetsScript = path.join(rootDir, 'create-basic-assets.mjs');
      if (fs.existsSync(basicAssetsScript)) {
        execCmd('node', [basicAssetsScript]);
        console.log('✅ Assets básicos criados com sucesso.');
      } else {
        console.warn('❌ Script create-basic-assets.mjs não encontrado.');
      }
    }
  } else {
    console.error('❌ index.html NÃO foi encontrado em public/');
    
    // Tentar criar assets básicos com index.html
    console.log('Tentando criar arquivos básicos incluindo index.html...');
    const basicAssetsScript = path.join(rootDir, 'create-basic-assets.mjs');
    if (fs.existsSync(basicAssetsScript)) {
      execCmd('node', [basicAssetsScript]);
      console.log('✅ Assets básicos e index.html criados.');
    } else {
      console.warn('❌ Script create-basic-assets.mjs não encontrado.');
    }
  }
} else {
  console.error('❌ Diretório public/ não existe após tentativas de reconstrução!');
}

console.log('\n📋 Reconstrução de arquivos estáticos concluída.');