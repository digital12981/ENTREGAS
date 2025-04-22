/**
 * Módulo de correção para o diretório public
 * 
 * Este módulo é projetado para ser importado no início da aplicação
 * em modo de produção e garantir que o diretório public exista e contenha
 * os arquivos estáticos necessários.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Função para mensagens de log
 */
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  
  switch (type) {
    case 'error':
      console.error(`${timestamp} [public-fix] ERROR: ${message}`);
      break;
    case 'warn':
      console.warn(`${timestamp} [public-fix] WARN: ${message}`);
      break;
    default:
      console.log(`${timestamp} [public-fix] ${message}`);
  }
}

/**
 * Executa um comando e retorna o resultado
 */
function exec(command) {
  try {
    const { execSync } = require('child_process');
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    log(`Erro ao executar comando: ${command}`, 'error');
    log(error.message, 'error');
    return null;
  }
}

/**
 * Função para garantir que o diretório public existe e contém
 * os arquivos necessários
 */
export function ensurePublicDirectory() {
  // Ativo apenas em produção
  if (process.env.NODE_ENV !== 'production') {
    log('Ignorando verificação de diretório public em ambiente de desenvolvimento');
    return;
  }
  
  log('Verificando diretório public...');
  
  // Configurar caminhos
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, '..');
  
  // Verificar diretórios importantes
  const publicDir = path.join(rootDir, 'public');
  const distDir = path.join(rootDir, 'dist');
  const distPublicDir = path.join(distDir, 'public');
  const distClientDir = path.join(distDir, 'client');
  
  // Criar diretório public se não existir
  if (!fs.existsSync(publicDir)) {
    log(`Diretório public não encontrado. Criando em ${publicDir}...`);
    try {
      fs.mkdirSync(publicDir, { recursive: true });
      log('Diretório public criado com sucesso');
    } catch (error) {
      log(`Erro ao criar diretório public: ${error.message}`, 'error');
      return;
    }
  }
  
  // Garantir que o diretório assets existe dentro de public
  const publicAssetsDir = path.join(publicDir, 'assets');
  if (!fs.existsSync(publicAssetsDir)) {
    log('Diretório assets não encontrado em public. Criando...');
    try {
      fs.mkdirSync(publicAssetsDir, { recursive: true });
      log('Diretório assets criado com sucesso');
    } catch (error) {
      log(`Erro ao criar diretório assets: ${error.message}`, 'error');
    }
  }
  
  // Função para copiar arquivos entre diretórios
  function copyFileIfExists(source, dest) {
    if (fs.existsSync(source)) {
      try {
        fs.copyFileSync(source, dest);
        log(`Arquivo copiado: ${path.basename(source)} -> ${path.relative(rootDir, dest)}`);
        return true;
      } catch (error) {
        log(`Erro ao copiar ${source} para ${dest}: ${error.message}`, 'error');
        return false;
      }
    }
    return false;
  }
  
  // Verificar se index.html existe e, se não, tentar copiá-lo de outro local
  const publicIndexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(publicIndexPath)) {
    log('index.html não encontrado em public. Tentando copiar de outros diretórios...');
    
    // Possíveis locais para index.html
    const possibleIndexPaths = [
      path.join(distPublicDir, 'index.html'),
      path.join(distClientDir, 'index.html'),
      path.join(rootDir, 'client', 'index.html')
    ];
    
    let copied = false;
    for (const sourcePath of possibleIndexPaths) {
      if (copyFileIfExists(sourcePath, publicIndexPath)) {
        copied = true;
        break;
      }
    }
    
    if (!copied) {
      log('Não foi possível encontrar index.html em nenhum diretório.', 'warn');
    }
  }
  
  // Verificar se favicon.ico existe
  const publicFaviconPath = path.join(publicDir, 'favicon.ico');
  if (!fs.existsSync(publicFaviconPath)) {
    log('favicon.ico não encontrado em public. Tentando copiar de outros diretórios...');
    
    // Possíveis locais para favicon.ico
    const possibleFaviconPaths = [
      path.join(distPublicDir, 'favicon.ico'),
      path.join(distClientDir, 'favicon.ico'),
      path.join(rootDir, 'client', 'favicon.ico'),
      path.join(rootDir, 'generated-icon.png') // Usar ícone gerado como fallback
    ];
    
    let copied = false;
    for (const sourcePath of possibleFaviconPaths) {
      if (copyFileIfExists(sourcePath, publicFaviconPath)) {
        copied = true;
        break;
      }
    }
    
    if (!copied) {
      log('Não foi possível encontrar favicon.ico em nenhum diretório.', 'warn');
    }
  }
  
  // Verificar diretório de assets
  // Copiar JS/CSS de dist/client/assets para public/assets se necessário
  if (fs.existsSync(path.join(distClientDir, 'assets'))) {
    const sourceAssetsDir = path.join(distClientDir, 'assets');
    log(`Verificando arquivos em ${sourceAssetsDir}...`);
    
    try {
      const files = fs.readdirSync(sourceAssetsDir);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      const cssFiles = files.filter(f => f.endsWith('.css'));
      
      log(`Encontrados ${jsFiles.length} arquivos JS e ${cssFiles.length} arquivos CSS`);
      
      // Copiar todos os arquivos JS e CSS
      [...jsFiles, ...cssFiles].forEach(file => {
        const sourceFile = path.join(sourceAssetsDir, file);
        const destFile = path.join(publicAssetsDir, file);
        copyFileIfExists(sourceFile, destFile);
      });
    } catch (error) {
      log(`Erro ao listar arquivos em ${sourceAssetsDir}: ${error.message}`, 'error');
    }
  } else {
    log('Diretório dist/client/assets não encontrado. Não é possível copiar JS/CSS.', 'warn');
  }
  
  log('Verificação e correção do diretório public concluídas');
}