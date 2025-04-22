#!/usr/bin/env node

/**
 * Script para corrigir caminhos nos arquivos estáticos para deploy na Heroku
 * 
 * Este script procura os arquivos HTML e corrige os caminhos para os recursos estáticos
 * para que apontem para a localização correta no ambiente de produção da Heroku.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

console.log('🔧 Corrigindo caminhos de arquivos estáticos para a Heroku...');

// Lista de diretórios onde procurar arquivos HTML
const directories = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'dist', 'public'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'dist', 'server', 'public')
];

// Criar diretórios se não existirem
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Criando diretório ${dir}...`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Verificar os diretórios de assets
function findAssetsDirectories() {
  const assetsDirectories = [];
  const possibleAssetsDirs = [
    path.join(rootDir, 'dist', 'client', 'assets'),
    path.join(rootDir, 'public', 'assets'),
    path.join(rootDir, 'dist', 'public', 'assets')
  ];

  possibleAssetsDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      assetsDirectories.push(dir);
      console.log(`Diretório de assets encontrado: ${dir}`);
      
      // Listar arquivos JS e CSS
      try {
        const files = fs.readdirSync(dir);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        const cssFiles = files.filter(f => f.endsWith('.css'));
        
        console.log(`  - Arquivos JS: ${jsFiles.length}`);
        if (jsFiles.length > 0) {
          console.log(`    - ${jsFiles.slice(0, 3).join(', ')}${jsFiles.length > 3 ? '...' : ''}`);
        }
        
        console.log(`  - Arquivos CSS: ${cssFiles.length}`);
        if (cssFiles.length > 0) {
          console.log(`    - ${cssFiles.slice(0, 3).join(', ')}${cssFiles.length > 3 ? '...' : ''}`);
        }
      } catch (err) {
        console.error(`Erro ao listar arquivos em ${dir}: ${err.message}`);
      }
    }
  });
  
  return assetsDirectories;
}

const assetsDirectories = findAssetsDirectories();

// Função para corrigir um arquivo HTML
function fixHtmlFile(filePath) {
  console.log(`Processando: ${filePath}`);
  
  try {
    // Ler o arquivo HTML
    let html = fs.readFileSync(filePath, 'utf8');
    let originalHtml = html;
    
    // Corrigir referências ao script principal
    const scriptPattern = /<script\s+type="module"\s+src="(\/src\/main\.tsx)"><\/script>/g;
    const scriptReplacement = (match, srcPath) => {
      // Verificar se temos index.js ou basic.js disponível
      const assetsDir = path.join(path.dirname(filePath), 'assets');
      if (fs.existsSync(path.join(assetsDir, 'index.js'))) {
        console.log(`  - Corrigindo caminho do script para index.js: ${srcPath} -> /assets/index.js`);
        return `<script type="module" crossorigin src="/assets/index.js"></script>`;
      } else if (fs.existsSync(path.join(assetsDir, 'basic.js'))) {
        console.log(`  - Corrigindo caminho do script para basic.js: ${srcPath} -> /assets/basic.js`);
        return `<script type="module" src="/assets/basic.js"></script>`;
      } else {
        // Fallback para index.js mesmo que não exista ainda
        console.log(`  - Corrigindo caminho do script (fallback): ${srcPath} -> /assets/index.js`);
        return `<script type="module" src="/assets/index.js"></script>`;
      }
    };
    html = html.replace(scriptPattern, scriptReplacement);
    
    // Corrigir referências a CSS
    const cssPattern = /<link\s+rel="stylesheet"\s+href="(\/src\/[^"]+\.css)"\s*\/?>/g;
    const cssReplacement = (match, hrefPath) => {
      // Verificar se temos index.css ou basic.css disponível
      const assetsDir = path.join(path.dirname(filePath), 'assets');
      if (fs.existsSync(path.join(assetsDir, 'index.css'))) {
        console.log(`  - Corrigindo caminho do CSS para index.css: ${hrefPath} -> /assets/index.css`);
        return `<link rel="stylesheet" crossorigin href="/assets/index.css">`;
      } else if (fs.existsSync(path.join(assetsDir, 'basic.css'))) {
        console.log(`  - Corrigindo caminho do CSS para basic.css: ${hrefPath} -> /assets/basic.css`);
        return `<link rel="stylesheet" href="/assets/basic.css">`;
      } else {
        // Fallback para index.css mesmo que não exista ainda
        console.log(`  - Corrigindo caminho do CSS (fallback): ${hrefPath} -> /assets/index.css`);
        return `<link rel="stylesheet" href="/assets/index.css">`;
      }
    };
    html = html.replace(cssPattern, cssReplacement);
    
    // Adicionar a tag link para o CSS se não existir
    const assetsDir = path.join(path.dirname(filePath), 'assets');
    if (!html.includes('link rel="stylesheet" href="/assets/index.css"') && 
        !html.includes('link rel="stylesheet" href="/assets/basic.css"') &&
        !html.includes('link rel="stylesheet" crossorigin href="/assets/index') &&
        !html.match(/href="\/assets\/index[^"]*\.css"/)) {
      
      const headPattern = /<\/head>/;
      
      // Decidir qual arquivo CSS usar
      let cssTag;
      if (fs.existsSync(path.join(assetsDir, 'index.css'))) {
        cssTag = '<link rel="stylesheet" crossorigin href="/assets/index.css">\n  ';
        console.log('  - Adicionando tag link para index.css');
      } else if (fs.existsSync(path.join(assetsDir, 'basic.css'))) {
        cssTag = '<link rel="stylesheet" href="/assets/basic.css">\n  ';
        console.log('  - Adicionando tag link para basic.css');
      } else {
        // Fallback
        cssTag = '<link rel="stylesheet" href="/assets/basic.css">\n  ';
        console.log('  - Adicionando tag link para CSS (fallback)');
      }
      
      html = html.replace(headPattern, `${cssTag}</head>`);
    }
    
    // Se não houve alterações, verificar outros padrões mais específicos
    if (html === originalHtml) {
      // Tentar encontrar qualquer referência a /src no HTML
      const srcPattern = /src="\/src\/([^"]+)"/g;
      html = html.replace(srcPattern, (match, path) => {
        console.log(`  - Corrigindo referência src genérica: /src/${path} -> /assets/${path}`);
        return `src="/assets/${path}"`;
      });
      
      // Tentar encontrar qualquer referência a /src no HTML para href
      const hrefPattern = /href="\/src\/([^"]+)"/g;
      html = html.replace(hrefPattern, (match, path) => {
        console.log(`  - Corrigindo referência href genérica: /src/${path} -> /assets/${path}`);
        return `href="/assets/${path}"`;
      });
      
      // Verificar se o script type="module" existe e ajustar apenas o src
      const moduleScriptPattern = /<script\s+type="module"\s+src="([^"]+)"><\/script>/g;
      html = html.replace(moduleScriptPattern, (match, srcPath) => {
        if (srcPath.startsWith('/src/') || srcPath === '/src/main.tsx') {
          const newPath = '/assets/index.js';
          console.log(`  - Corrigindo caminho do script: ${srcPath} -> ${newPath}`);
          return `<script type="module" src="${newPath}"></script>`;
        }
        return match;
      });
    }
    
    // Salvar o arquivo corrigido apenas se houve alterações
    if (html !== originalHtml) {
      fs.writeFileSync(filePath, html);
      console.log(`✅ Arquivo HTML corrigido e salvo: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️ Nenhuma alteração necessária: ${filePath}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Erro ao processar arquivo ${filePath}: ${err.message}`);
    return false;
  }
}

// Função para copiar um arquivo HTML para todos os diretórios
function copyHtmlToAllDirectories(sourcePath) {
  const filename = path.basename(sourcePath);
  const sourceDir = path.dirname(sourcePath);
  
  directories.forEach(dir => {
    if (dir !== sourceDir) {
      const targetPath = path.join(dir, filename);
      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copiado ${filename} para ${dir}`);
      } catch (err) {
        console.error(`❌ Erro ao copiar para ${targetPath}: ${err.message}`);
      }
    }
  });
}

// Função para copiar arquivos de assets entre diretórios
function copyAssetsBetweenDirectories() {
  if (assetsDirectories.length <= 1) {
    console.log('Não há necessidade de copiar assets entre diretórios (encontrado apenas 0-1 diretórios)');
    return;
  }
  
  // Usar o primeiro diretório como fonte
  const sourceDir = assetsDirectories[0];
  const files = fs.readdirSync(sourceDir);
  
  // Copiar para outros diretórios de assets
  for (let i = 1; i < assetsDirectories.length; i++) {
    const targetDir = assetsDirectories[i];
    
    files.forEach(file => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      // Verificar se é um arquivo (não um diretório)
      if (fs.statSync(sourcePath).isFile()) {
        try {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`Copiado ${file} de ${sourceDir} para ${targetDir}`);
        } catch (err) {
          console.error(`Erro ao copiar ${file}: ${err.message}`);
        }
      }
    });
  }
  
  console.log('Sincronização de assets entre diretórios concluída');
}

// Procurar e corrigir arquivos HTML
let processedHtmlFiles = [];
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      const files = fs.readdirSync(dir);
      const htmlFiles = files.filter(file => file.endsWith('.html'));
      
      htmlFiles.forEach(file => {
        const filePath = path.join(dir, file);
        if (fixHtmlFile(filePath)) {
          processedHtmlFiles.push(filePath);
        }
      });
    } catch (err) {
      console.error(`Erro ao ler diretório ${dir}: ${err.message}`);
    }
  } else {
    console.log(`Diretório não encontrado: ${dir}`);
  }
});

// Se nenhum arquivo HTML foi encontrado, procurar em client/index.html
if (processedHtmlFiles.length === 0) {
  const clientIndexPath = path.join(rootDir, 'client', 'index.html');
  
  if (fs.existsSync(clientIndexPath)) {
    console.log('Nenhum HTML encontrado nos diretórios de produção. Usando client/index.html...');
    
    if (fixHtmlFile(clientIndexPath)) {
      // Se o arquivo foi corrigido, copiar para todos os diretórios de produção
      directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        const targetPath = path.join(dir, 'index.html');
        try {
          fs.copyFileSync(clientIndexPath, targetPath);
          console.log(`✅ Copiado index.html para ${dir}`);
        } catch (err) {
          console.error(`❌ Erro ao copiar para ${targetPath}: ${err.message}`);
        }
      });
      
      processedHtmlFiles.push(clientIndexPath);
    }
  } else {
    console.error('❌ Não foi possível encontrar nenhum arquivo HTML para corrigir!');
  }
}

// Copiar assets entre diretórios
if (assetsDirectories.length > 0) {
  copyAssetsBetweenDirectories();
} else {
  console.warn('⚠️ Nenhum diretório de assets encontrado!');
}

// Criar diretórios de assets se não existirem
directories.forEach(dir => {
  const assetsDir = path.join(dir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    try {
      fs.mkdirSync(assetsDir, { recursive: true });
      console.log(`Criado diretório de assets em ${dir}`);
    } catch (err) {
      console.error(`Erro ao criar diretório de assets em ${dir}: ${err.message}`);
    }
  }
});

// Resumo
console.log('\n📋 Resumo:');
console.log(`- Diretórios verificados: ${directories.length}`);
console.log(`- Arquivos HTML processados: ${processedHtmlFiles.length}`);
console.log(`- Diretórios de assets encontrados: ${assetsDirectories.length}`);

if (processedHtmlFiles.length > 0) {
  console.log('✅ Processo de correção concluído com sucesso!');
} else {
  console.log('⚠️ Nenhum arquivo HTML foi processado. Verifique os logs para mais detalhes.');
}

console.log('\n🚀 Pronto para implantação na Heroku!');