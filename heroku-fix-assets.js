/**
 * Script para converter referências a assets com hash no HTML
 * Será usado como middleware no Express para modificar o HTML antes de servir
 */

const fs = require('fs');
const path = require('path');

/**
 * Identifica o arquivo real correspondente a um asset com hash
 * Exemplo: Entrada: index-BRHWOuev.css, Saída: caminho completo para o arquivo real
 */
function findRealAsset(assetPath, rootDir) {
  // Extrair informações do path
  const assetDir = path.dirname(assetPath);
  const assetFile = path.basename(assetPath);
  
  // Extrair nome base e extensão
  const match = assetFile.match(/^([^-]+)(-[A-Za-z0-9]+)?\.([^.]+)$/);
  if (!match) return null;
  
  const baseName = match[1];
  const extension = match[3];
  const pattern = new RegExp(`^${baseName}(-[A-Za-z0-9]+)?\\.${extension}$`);
  
  // Caminhos possíveis onde o asset pode estar
  const dirs = [
    path.join(rootDir, 'dist', 'assets'),
    path.join(rootDir, 'dist', 'public', 'assets'),
    path.join(rootDir, 'dist')
  ];
  
  // Buscar em cada diretório
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir);
    const matchingFiles = files.filter(file => pattern.test(file));
    
    if (matchingFiles.length > 0) {
      // Retornar o caminho URL para o arquivo encontrado
      return path.join(assetDir, matchingFiles[0]);
    }
  }
  
  return null;
}

/**
 * Processa o HTML para substituir referências a assets com hash
 */
function processHtml(html, rootDir) {
  if (!html) return html;
  
  // Substituir referências a assets com hash
  return html.replace(/(src|href)="(\/assets\/[^"]+)-[A-Za-z0-9]+\.([^"]+)"/g, 
    (match, attr, path, ext) => {
      const assetPath = `${path}.${ext}`;
      const realPath = findRealAsset(assetPath, rootDir);
      if (realPath) {
        return `${attr}="${realPath}"`;
      }
      return `${attr}="${path}.${ext}"`;
    });
}

module.exports = {
  processHtml,
  findRealAsset
};