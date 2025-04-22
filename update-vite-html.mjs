#!/usr/bin/env node

/**
 * Script de atualização de HTML para o Vite
 * 
 * Este script verifica o HTML produzido pelo Vite e corrige as referências
 * para garantir que os arquivos JS e CSS sejam carregados corretamente
 * independente do ambiente.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

console.log('🔧 Atualizando HTML para o Vite...');

// Todos os possíveis caminhos onde o index.html pode estar
const htmlPaths = [
  path.join(rootDir, 'dist', 'public', 'index.html'),
  path.join(rootDir, 'public', 'index.html'),
  path.join(rootDir, 'dist', 'client', 'index.html'),
  path.join(rootDir, 'client', 'index.html'),
  path.join(rootDir, 'index.html')
];

// Todos os possíveis caminhos onde os assets podem estar
const assetsPaths = [
  path.join(rootDir, 'dist', 'public', 'assets'),
  path.join(rootDir, 'public', 'assets'),
  path.join(rootDir, 'dist', 'client', 'assets'),
  path.join(rootDir, 'client', 'dist', 'assets'),
  path.join(rootDir, 'assets')
];

// Encontrar os arquivos JS e CSS mais recentes em qualquer diretório de assets
function findLatestAssets() {
  let jsFile = null;
  let cssFile = null;
  let jsFileFound = false;
  let cssFileFound = false;
  
  for (const assetsPath of assetsPaths) {
    if (!fs.existsSync(assetsPath)) continue;
    
    try {
      const files = fs.readdirSync(assetsPath);
      
      // Procurar arquivos compilados do Vite (geralmente com hash no nome)
      const jsFiles = files.filter(f => f.endsWith('.js') && (f.startsWith('index-') || f === 'index.js'));
      const cssFiles = files.filter(f => f.endsWith('.css') && (f.startsWith('index-') || f === 'index.css'));
      
      if (jsFiles.length > 0 && !jsFileFound) {
        jsFile = jsFiles[0];
        jsFileFound = true;
        console.log(`Encontrado arquivo JS: ${jsFile} em ${assetsPath}`);
      }
      
      if (cssFiles.length > 0 && !cssFileFound) {
        cssFile = cssFiles[0];
        cssFileFound = true;
        console.log(`Encontrado arquivo CSS: ${cssFile} em ${assetsPath}`);
      }
      
      // Se encontramos ambos, podemos parar
      if (jsFileFound && cssFileFound) break;
    } catch (err) {
      console.error(`Erro ao ler diretório ${assetsPath}: ${err.message}`);
    }
  }
  
  // Se não encontrou arquivos Vite, tentar os arquivos básicos
  if (!jsFileFound) {
    for (const assetsPath of assetsPaths) {
      if (!fs.existsSync(assetsPath)) continue;
      
      try {
        const files = fs.readdirSync(assetsPath);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        
        if (jsFiles.includes('basic.js')) {
          jsFile = 'basic.js';
          jsFileFound = true;
          console.log(`Usando arquivo JS básico em ${assetsPath}`);
          break;
        } else if (jsFiles.length > 0) {
          jsFile = jsFiles[0];
          jsFileFound = true;
          console.log(`Usando primeiro arquivo JS encontrado: ${jsFile} em ${assetsPath}`);
          break;
        }
      } catch (err) {
        // Ignorar erros e continuar
      }
    }
  }
  
  if (!cssFileFound) {
    for (const assetsPath of assetsPaths) {
      if (!fs.existsSync(assetsPath)) continue;
      
      try {
        const files = fs.readdirSync(assetsPath);
        const cssFiles = files.filter(f => f.endsWith('.css'));
        
        if (cssFiles.includes('basic.css')) {
          cssFile = 'basic.css';
          cssFileFound = true;
          console.log(`Usando arquivo CSS básico em ${assetsPath}`);
          break;
        } else if (cssFiles.length > 0) {
          cssFile = cssFiles[0];
          cssFileFound = true;
          console.log(`Usando primeiro arquivo CSS encontrado: ${cssFile} em ${assetsPath}`);
          break;
        }
      } catch (err) {
        // Ignorar erros e continuar
      }
    }
  }
  
  return { jsFile, cssFile, jsFileFound, cssFileFound };
}

// Atualizar todos os HTMLs encontrados com as referências corretas
function updateHtmlFiles(jsFile, cssFile) {
  for (const htmlPath of htmlPaths) {
    if (!fs.existsSync(htmlPath)) continue;
    
    try {
      console.log(`Processando arquivo HTML: ${htmlPath}`);
      let html = fs.readFileSync(htmlPath, 'utf8');
      let updated = false;
      
      // Guardar o HTML original para comparação
      const originalHtml = html;
      
      // 1. Substituir referências a /src/main.tsx pelo arquivo JS encontrado
      if (jsFile) {
        const srcPattern = /<script\s+type="module"\s+src="\/src\/main\.tsx"><\/script>/g;
        const jsReplacement = `<script type="module" crossorigin src="/assets/${jsFile}"></script>`;
        
        if (html.match(srcPattern)) {
          html = html.replace(srcPattern, jsReplacement);
          updated = true;
          console.log(`  - Substituído /src/main.tsx por /assets/${jsFile}`);
        } else if (!html.includes(`src="/assets/${jsFile}"`) && !html.includes('src="/assets/index')) {
          // Se o script não existir, adicionar antes do </body>
          const bodyPattern = /<\/body>/;
          if (html.match(bodyPattern)) {
            html = html.replace(bodyPattern, `<script type="module" crossorigin src="/assets/${jsFile}"></script>\n</body>`);
            updated = true;
            console.log(`  - Adicionado script para /assets/${jsFile}`);
          }
        }
      }
      
      // 2. Adicionar o CSS se necessário
      if (cssFile && !html.includes(`href="/assets/${cssFile}"`) && 
          !html.includes('href="/assets/index') && 
          !html.includes('href="/src/')) {
          
        const headPattern = /<\/head>/;
        if (html.match(headPattern)) {
          html = html.replace(headPattern, `<link rel="stylesheet" href="/assets/${cssFile}">\n</head>`);
          updated = true;
          console.log(`  - Adicionado link para CSS /assets/${cssFile}`);
        }
      }
      
      // 3. Verificar se há referência a algum CSS em /src e substituir
      const cssSourcePattern = /<link\s+rel="stylesheet"\s+href="\/src\/[^"]+"/g;
      if (cssFile && html.match(cssSourcePattern)) {
        html = html.replace(cssSourcePattern, `<link rel="stylesheet" href="/assets/${cssFile}"`);
        updated = true;
        console.log(`  - Substituída referência a CSS em /src por /assets/${cssFile}`);
      }
      
      // 4. Garantir que há um elemento div#root no body se não existir
      if (!html.includes('id="root"')) {
        const bodyStartPattern = /<body[^>]*>/;
        if (html.match(bodyStartPattern)) {
          html = html.replace(bodyStartPattern, '$&\n  <div id="root"></div>');
          updated = true;
          console.log('  - Adicionado elemento div#root ao body');
        }
      }
      
      // 5. Verificar se o charset e viewport estão configurados corretamente
      if (!html.includes('charset=') || !html.includes('viewport')) {
        const headStartPattern = /<head[^>]*>/;
        if (html.match(headStartPattern)) {
          let metaTags = '';
          
          if (!html.includes('charset=')) {
            metaTags += '\n  <meta charset="UTF-8">';
            console.log('  - Adicionado meta charset');
          }
          
          if (!html.includes('viewport')) {
            metaTags += '\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">';
            console.log('  - Adicionado meta viewport');
          }
          
          html = html.replace(headStartPattern, `$&${metaTags}`);
          updated = true;
        }
      }
      
      // Salvar apenas se houve alterações
      if (updated) {
        fs.writeFileSync(htmlPath, html);
        console.log(`✅ Arquivo HTML atualizado: ${htmlPath}`);
        
        // Copiar este arquivo atualizado para outros locais
        for (const destPath of htmlPaths) {
          if (destPath !== htmlPath && fs.existsSync(path.dirname(destPath))) {
            try {
              fs.writeFileSync(destPath, html);
              console.log(`Copiado HTML atualizado para ${destPath}`);
            } catch (err) {
              console.error(`Erro ao copiar para ${destPath}: ${err.message}`);
            }
          }
        }
      } else {
        console.log(`⚠️ Nenhuma alteração necessária para ${htmlPath}`);
      }
    } catch (err) {
      console.error(`❌ Erro ao processar ${htmlPath}: ${err.message}`);
    }
  }
}

// Encontrar e criar assets básicos se nenhum for encontrado
async function createBasicAssetsIfNeeded(jsFileFound, cssFileFound) {
  if (!jsFileFound || !cssFileFound) {
    console.log('Assets não encontrados. Criando assets básicos...');
    
    // Verificar se existe script create-basic-assets.mjs
    const basicAssetsScript = path.join(rootDir, 'create-basic-assets.mjs');
    if (fs.existsSync(basicAssetsScript)) {
      try {
        console.log('Executando script de criação de assets básicos...');
        const { execSync } = await import('child_process');
        execSync('node create-basic-assets.mjs', { stdio: 'inherit' });
      } catch (err) {
        console.error(`Erro ao executar script de assets básicos: ${err.message}`);
      }
    } else {
      // Criar manualmente se o script não existir
      console.log('Script de assets básicos não encontrado. Criando manualmente...');
      
      // Escolher o primeiro diretório assets disponível
      let targetAssetsDir = null;
      for (const assetsPath of assetsPaths) {
        const assetsDirExists = fs.existsSync(assetsPath);
        const parentDirExists = fs.existsSync(path.dirname(assetsPath));
        
        if (assetsDirExists) {
          targetAssetsDir = assetsPath;
          break;
        } else if (parentDirExists) {
          try {
            fs.mkdirSync(assetsPath, { recursive: true });
            targetAssetsDir = assetsPath;
            break;
          } catch (err) {
            console.error(`Erro ao criar diretório ${assetsPath}: ${err.message}`);
          }
        }
      }
      
      if (targetAssetsDir) {
        // Criar um arquivo JS básico
        if (!jsFileFound) {
          const jsContent = `// Arquivo JS básico
console.log('Aplicação carregada no modo compatibilidade.');
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<div style="text-align:center;padding:50px;"><h1 style="color:#ee4d2d;">Shopee Entregas</h1><p>Carregando aplicação...</p></div>';
  }
});`;
          
          try {
            fs.writeFileSync(path.join(targetAssetsDir, 'basic.js'), jsContent);
            console.log('Criado arquivo JS básico');
          } catch (err) {
            console.error(`Erro ao criar arquivo JS básico: ${err.message}`);
          }
        }
        
        // Criar um arquivo CSS básico
        if (!cssFileFound) {
          const cssContent = `/* Estilos básicos */
:root {
  --primary: #ee4d2d;
  --secondary: #f5f5f5;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--secondary);
}
#root {
  min-height: 100vh;
}`;
          
          try {
            fs.writeFileSync(path.join(targetAssetsDir, 'basic.css'), cssContent);
            console.log('Criado arquivo CSS básico');
          } catch (err) {
            console.error(`Erro ao criar arquivo CSS básico: ${err.message}`);
          }
        }
      } else {
        console.error('Não foi possível encontrar ou criar um diretório de assets!');
      }
    }
  }
}

// Executar o script
try {
  // Encontrar os assets mais recentes
  const { jsFile, cssFile, jsFileFound, cssFileFound } = findLatestAssets();
  
  // Criar assets básicos se necessário
  if (!jsFileFound || !cssFileFound) {
    createBasicAssetsIfNeeded(jsFileFound, cssFileFound);
    
    // Procurar novamente depois de criar
    const assets = findLatestAssets();
    updateHtmlFiles(assets.jsFile || 'basic.js', assets.cssFile || 'basic.css');
  } else {
    // Atualizar HTMLs com os assets encontrados
    updateHtmlFiles(jsFile, cssFile);
  }
  
  console.log('✅ Processo de atualização de HTML concluído!');
} catch (err) {
  console.error(`❌ Erro na execução do script: ${err.message}`);
  console.error(err.stack);
}