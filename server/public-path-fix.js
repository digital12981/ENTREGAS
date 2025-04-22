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
import { execSync } from 'child_process';

// Obter o diretório atual para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function ensurePublicDirectory() {
  console.log('[PublicPathFix] Verificando diretório público...');
  
  // Caminhos importantes
  const rootDir = path.resolve(__dirname, '..');
  const publicDir = path.resolve(rootDir, 'public');
  const distDir = path.resolve(rootDir, 'dist');
  const distClientDir = path.resolve(distDir, 'client');
  
  // Verificar se o diretório public existe
  if (!fs.existsSync(publicDir)) {
    console.log('[PublicPathFix] Diretório public não encontrado, criando...');
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Verificar se já temos arquivos no diretório public
  const publicFiles = fs.existsSync(publicDir) ? fs.readdirSync(publicDir) : [];
  
  // Se o public estiver vazio, tentar copiar arquivos estáticos de dist/client ou dist
  if (publicFiles.length === 0) {
    console.log('[PublicPathFix] Diretório public vazio, procurando arquivos estáticos...');
    
    // Verificar dist/client
    if (fs.existsSync(distClientDir) && fs.readdirSync(distClientDir).includes('index.html')) {
      console.log('[PublicPathFix] Copiando arquivos de dist/client para public...');
      try {
        execSync(`cp -r ${distClientDir}/* ${publicDir}/`, { stdio: 'inherit' });
      } catch (error) {
        console.error('[PublicPathFix] Erro ao copiar arquivos:', error);
      }
    } 
    // Verificar dist
    else if (fs.existsSync(distDir) && fs.readdirSync(distDir).includes('index.html')) {
      console.log('[PublicPathFix] Copiando arquivos de dist para public...');
      try {
        execSync(`cp -r ${distDir}/* ${publicDir}/`, { stdio: 'inherit' });
      } catch (error) {
        console.error('[PublicPathFix] Erro ao copiar arquivos:', error);
      }
    } else {
      console.warn('[PublicPathFix] Não foi possível encontrar arquivos estáticos para copiar');
    }
  } else {
    console.log(`[PublicPathFix] Diretório public contém ${publicFiles.length} arquivos.`);
  }
  
  // Verificar novamente se temos index.html em public
  const hasIndexHtml = fs.existsSync(path.join(publicDir, 'index.html'));
  if (hasIndexHtml) {
    console.log('[PublicPathFix] Verificação concluída: index.html encontrado em public/');
  } else {
    console.warn('[PublicPathFix] ATENÇÃO: index.html não encontrado em public/!');
  }
  
  return { 
    publicDir, 
    hasFiles: publicFiles.length > 0,
    hasIndexHtml
  };
}