/**
 * Script para mapear assets com hash para nomes simplificados
 * 
 * Este script é executado durante o build e cria um arquivo JSON
 * mapeando caminhos como "/assets/index-B7US44-a.js" para "/assets/index.js"
 */

const fs = require('fs');
const path = require('path');

// Função para fazer o mapeamento recursivo de arquivos em um diretório
function mapAssetsInDirectory(dir, basePath = '') {
  const result = {};
  
  if (!fs.existsSync(dir)) {
    console.log(`Diretório não encontrado: ${dir}`);
    return result;
  }
  
  // Listar todos os arquivos no diretório
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  // Processar cada item
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.join(basePath, item.name);
    
    if (item.isDirectory()) {
      // Recursivamente mapear subdiretórios
      const subDirMap = mapAssetsInDirectory(fullPath, relativePath);
      Object.assign(result, subDirMap);
    } else if (item.isFile()) {
      // Verificar se é um arquivo com hash no nome (como index-ABC123.js)
      const match = item.name.match(/^([^-]+)(-[A-Za-z0-9]+)(\.[a-zA-Z0-9]+)$/);
      if (match) {
        const baseName = match[1];
        const extension = match[3];
        const simpleFileName = `${baseName}${extension}`;
        const simplePath = path.join(path.dirname(relativePath), simpleFileName);
        
        // Adicionar ao mapeamento
        result[`/${relativePath}`] = `/${simplePath}`;
      }
    }
  }
  
  return result;
}

// Detectar estrutura de diretórios
const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(distDir, 'assets');
const publicDir = path.join(distDir, 'public');
const publicAssetsDir = path.join(publicDir, 'assets');

// Criar mapeamento de assets
const assetMap = {
  ...mapAssetsInDirectory(assetsDir, 'assets'),
  ...mapAssetsInDirectory(publicAssetsDir, 'public/assets'),
  ...mapAssetsInDirectory(distDir)
};

// Exibir resultados
console.log('Mapeamento de assets:');
console.log(JSON.stringify(assetMap, null, 2));

// Salvar o mapeamento em um arquivo
const outputPath = path.join(distDir, 'asset-map.json');
fs.writeFileSync(outputPath, JSON.stringify(assetMap, null, 2));

console.log(`Mapeamento de assets salvo em: ${outputPath}`);