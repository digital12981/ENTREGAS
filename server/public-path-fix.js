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
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Função para mensagens de log
 */
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}] [public-fix]`;
  
  if (type === 'error') {
    console.error(`${prefix} ERROR: ${message}`);
  } else if (type === 'warn') {
    console.warn(`${prefix} WARN: ${message}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Executa um comando e retorna o resultado
 */
function exec(command) {
  log(`Executando: ${command}`);
  const result = spawnSync(command, { shell: true, stdio: 'inherit' });
  return result.status === 0;
}

/**
 * Função para garantir que o diretório public existe e contém
 * os arquivos necessários
 */
export function ensurePublicDirectory() {
  // Apenas executar em produção
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  
  log('Verificando diretório public...');
  
  // Caminhos importantes
  const rootDir = path.resolve(__dirname, '..');
  const publicDir = path.join(rootDir, 'public');
  const distDir = path.join(rootDir, 'dist');
  const distClientDir = path.join(distDir, 'client');
  
  // Verificar se public existe
  if (!fs.existsSync(publicDir)) {
    log('Diretório public não encontrado. Criando...', 'warn');
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Verificar index.html
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    log('index.html não encontrado em public/. Tentando copiar de outras localizações...', 'warn');
    
    // Locais possíveis para index.html
    const possibleSources = [
      { path: path.join(distClientDir, 'index.html'), cmd: `cp -r ${distClientDir}/* ${publicDir}/` },
      { path: path.join(distDir, 'index.html'), cmd: `cp -r ${distDir}/* ${publicDir}/` },
      { path: path.join(rootDir, 'client/index.html'), cmd: `cp -r ${path.join(rootDir, 'client')}/* ${publicDir}/` }
    ];
    
    let fixed = false;
    for (const source of possibleSources) {
      if (fs.existsSync(source.path)) {
        log(`Encontrado index.html em ${source.path}. Copiando...`);
        exec(source.cmd);
        fixed = true;
        break;
      }
    }
    
    if (!fixed) {
      log('Não foi possível encontrar index.html em nenhum local conhecido.', 'error');
      log('Tentando reconstruir os arquivos estáticos...', 'warn');
      
      // Tentar executar script de reconstrução
      const rebuildScriptPath = path.join(rootDir, 'rebuild-static.mjs');
      if (fs.existsSync(rebuildScriptPath)) {
        exec(`node ${rebuildScriptPath}`);
      } else {
        log('Script rebuild-static.mjs não encontrado.', 'error');
        
        // Último recurso: criar um index.html básico
        log('Criando index.html básico de fallback...', 'warn');
        
        const fallbackHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopee Entregas</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #ee4d2d; text-align: center; }
    .message { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .warning { color: #e74c3c; }
  </style>
</head>
<body>
  <h1>Shopee Entregas</h1>
  <div class="message">
    <p>Obrigado por seu interesse em se tornar um parceiro de entregas da Shopee!</p>
    <p>Estamos com problemas técnicos temporários. Por favor, tente novamente mais tarde.</p>
    <p class="warning"><strong>Erro técnico:</strong> Arquivos estáticos não encontrados.</p>
  </div>
</body>
</html>
`;
        
        try {
          fs.writeFileSync(indexPath, fallbackHtml);
          log('index.html básico criado com sucesso.');
        } catch (err) {
          log(`Erro ao criar index.html: ${err.message}`, 'error');
        }
      }
    }
  }
  
  // Verificar se o diretório public contém arquivos
  const publicFiles = fs.readdirSync(publicDir);
  
  if (publicFiles.length === 0) {
    log('O diretório public está vazio!', 'error');
  } else if (!publicFiles.includes('index.html')) {
    log('O diretório public não contém index.html!', 'error');
  } else {
    // Verificar se há arquivos de script e estilo
    const hasAssets = publicFiles.some(file => 
      file === 'assets' || 
      file.endsWith('.js') || 
      file.endsWith('.css'));
    
    if (!hasAssets) {
      log('O diretório public não contém arquivos de assets!', 'warn');
    } else {
      log(`Diretório public configurado corretamente com ${publicFiles.length} arquivos.`);
    }
  }
}

// Para uso direto via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ensurePublicDirectory();
}