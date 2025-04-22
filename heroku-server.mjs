/**
 * Servidor Express simplificado para Heroku
 * 
 * Implementação minimalista para servir arquivos estáticos e APIs REST
 * sem dependências de propriedades não padrão como import.meta.dirname
 */
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { createServer } from 'http';
import fs from 'fs';

// Obter diretório atual de forma compatível com ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Função utilitária para processar HTML e ajustar referências a assets com hash
function fixAssetReferences(html, distDir) {
  if (!html) return html;
  
  // Substituir referências a arquivos JS e CSS com hash para versões sem hash
  return html.replace(/(src|href)="(\/assets\/[^"]+)-[A-Za-z0-9]+\.([^"]+)"/g, (match, attr, path, ext) => {
    console.log(`Processando referência a asset: ${match}`);
    
    // Extrair informações do caminho
    const pathParts = path.split('/');
    const baseName = pathParts.pop(); // Último elemento é o nome do arquivo sem extensão/hash
    const assetDir = pathParts.join('/'); // Diretório onde o asset deveria estar
    
    console.log(`Buscando asset para base: ${baseName}, extensão: ${ext}`);
    
    // Tentar encontrar o arquivo real com hash na pasta de assets
    try {
      // Lista de diretórios a verificar
      const dirsToCheck = [
        join(distDir, 'assets'),
        join(distDir, 'public', 'assets'),
        join(distDir)
      ];
      
      for (const dir of dirsToCheck) {
        if (!fs.existsSync(dir)) continue;
        
        console.log(`Procurando em: ${dir}`);
        const files = fs.readdirSync(dir);
        const pattern = new RegExp(`^${baseName}(-[A-Za-z0-9]+)?\\.${ext}$`);
        const matchingFiles = files.filter(file => pattern.test(file));
        
        if (matchingFiles.length > 0) {
          const fixedPath = `${attr}="/assets/${matchingFiles[0]}"`;
          console.log(`✅ Referência corrigida: ${match} -> ${fixedPath}`);
          return fixedPath;
        }
      }
      
      // Se não encontrou em nenhum diretório padrão, tentar busca recursiva
      function findFileRecursive(dir, pattern) {
        if (!fs.existsSync(dir)) return null;
        
        try {
          const files = fs.readdirSync(dir);
          
          // Procurar por arquivos correspondentes neste diretório
          for (const file of files) {
            if (pattern.test(file)) {
              return join(dir, file);
            }
          }
          
          // Procurar em subdiretórios
          for (const file of files) {
            const fullPath = join(dir, file);
            try {
              if (fs.statSync(fullPath).isDirectory()) {
                const found = findFileRecursive(fullPath, pattern);
                if (found) return found;
              }
            } catch (e) {
              // Ignorar erros ao verificar subdiretórios
            }
          }
        } catch (e) {
          console.warn(`Erro ao ler diretório ${dir}:`, e.message);
        }
        
        return null;
      }
      
      // Tentar buscar de forma mais abrangente em toda a árvore de dist
      console.log(`Realizando busca recursiva para ${baseName}.${ext}...`);
      const pattern = new RegExp(`^${baseName}(-[A-Za-z0-9]+)?\\.${ext}$`);
      const foundPath = findFileRecursive(distDir, pattern);
      
      if (foundPath) {
        const relativePath = foundPath.replace(distDir, '').replace(/^\//, '');
        const fixedPath = `${attr}="/${relativePath}"`;
        console.log(`✅ Encontrado por busca recursiva: ${fixedPath}`);
        return fixedPath;
      }
    } catch (e) {
      console.error('Erro ao buscar asset real:', e.message);
    }
    
    // Se não encontrou, remover o hash para tentar encontrar a versão não hashada
    console.log(`⚠️ Não encontrado asset real, usando versão sem hash: ${baseName}.${ext}`);
    return `${attr}="${assetDir}/${baseName}.${ext}"`; 
  });
}

// Importar APIs necessárias
import { pool, db } from './dist/server/db.js';
import { storage } from './dist/server/storage.js';
import { paymentService } from './dist/server/payment.js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Configurar headers para UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Logging de tempo de resposta para APIs
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// ========================
// Configurar rotas da API
// ========================
async function setupApiRoutes() {
  // API de regiões
  app.get('/api/regions', async (req, res) => {
    try {
      const regions = await storage.getStatesWithVacancies();
      res.json(regions);
    } catch (error) {
      console.error('Erro ao buscar regiões:', error);
      res.status(500).json({ message: 'Erro ao buscar regiões' });
    }
  });

  // API de benefícios
  app.get('/api/benefits', async (req, res) => {
    try {
      const benefits = await storage.getAllBenefits();
      res.json(benefits);
    } catch (error) {
      console.error('Erro ao buscar benefícios:', error);
      res.status(500).json({ message: 'Erro ao buscar benefícios' });
    }
  });

  // API de pagamentos
  app.post('/api/payments', async (req, res) => {
    try {
      const { name, email, cpf, phone, amount } = req.body;
      
      if (!name || !email || !cpf || !amount) {
        return res.status(400).json({ 
          message: 'Dados incompletos. Todos os campos são obrigatórios.' 
        });
      }

      const payment = await paymentService.createPixPayment({
        name, email, cpf, phone, amount
      });

      res.json(payment);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      res.status(500).json({ 
        message: 'Erro ao processar pagamento. Tente novamente mais tarde.',
        error: error.message 
      });
    }
  });

  return createServer(app);
}

// ========================
// Servir arquivos estáticos
// ========================
function serveStaticFiles() {
  // Caminho para a pasta de arquivos compilados (frontend)
  const publicDir = join(__dirname, 'dist', 'public');
  
  if (!fs.existsSync(publicDir)) {
    console.warn(`⚠️ Diretório de arquivos estáticos não encontrado: ${publicDir}`);
    console.log('Diretórios disponíveis:');
    
    // Listar diretórios disponíveis para debug
    try {
      const distDir = join(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        console.log(`Conteúdo de ${distDir}:`);
        const distContent = fs.readdirSync(distDir);
        console.log(distContent);
        
        // Verificar pasta assets
        const assetsDir = join(distDir, 'public', 'assets');
        if (fs.existsSync(assetsDir)) {
          console.log(`Conteúdo de ${assetsDir}:`);
          const assetsContent = fs.readdirSync(assetsDir);
          console.log(assetsContent);
        }
      }
    } catch (e) {
      console.error('Erro ao listar diretórios:', e);
    }
    
    // Criar uma página temporária caso os arquivos estáticos não existam
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return; // Skip para APIs
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Shopee Entregador</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
            .message { background: #ffffd0; border-left: 4px solid #ffcc00; padding: 1rem; }
          </style>
        </head>
        <body>
          <h1>Shopee Entregador</h1>
          <div class="message">
            <p>Aplicação em manutenção. Por favor, volte em alguns instantes.</p>
          </div>
        </body>
        </html>
      `);
    });
    
    return;
  }
  
  // Verificar a estrutura real dos diretórios após o build
  const directoryStructure = {};
  
  // Investigar a estrutura de dist
  const distDir = join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    directoryStructure.dist = fs.readdirSync(distDir);
    
    // Verificar se existe a pasta 'assets' diretamente em dist
    const distAssets = join(distDir, 'assets');
    if (fs.existsSync(distAssets)) {
      directoryStructure.distAssets = fs.readdirSync(distAssets);
    }
    
    // Verificar se existe a pasta 'public' em dist
    const distPublic = join(distDir, 'public');
    if (fs.existsSync(distPublic)) {
      directoryStructure.distPublic = fs.readdirSync(distPublic);
      
      // Verificar se existe a pasta 'assets' dentro de public
      const publicAssets = join(distPublic, 'assets');
      if (fs.existsSync(publicAssets)) {
        directoryStructure.publicAssets = fs.readdirSync(publicAssets);
      }
    }
  }
  
  console.log('Estrutura de diretórios encontrada:');
  console.log(JSON.stringify(directoryStructure, null, 2));
  
  // Servir arquivos estáticos considerando todas as possíveis estruturas
  
  // Carregar mapeamento de assets se existir
  let assetMap = {};
  const assetMapPath = join(distDir, 'asset-map.json');
  if (fs.existsSync(assetMapPath)) {
    try {
      assetMap = JSON.parse(fs.readFileSync(assetMapPath, 'utf8'));
      console.log('✅ Mapeamento de assets carregado com sucesso');
      console.log(`Encontrados ${Object.keys(assetMap).length} mapeamentos de assets`);
    } catch (e) {
      console.warn('⚠️ Erro ao carregar mapeamento de assets:', e.message);
    }
  } else {
    console.log('ℹ️ Arquivo de mapeamento de assets não encontrado');
  }
  
  // 1. Primeiro, tentar servir de dist/public se existir
  if (fs.existsSync(publicDir)) {
    console.log(`Servindo arquivos estáticos de: ${publicDir}`);
    app.use(express.static(publicDir, { 
      maxAge: '1d',  // Cache de 1 dia para arquivos estáticos
      index: false   // Não servir index.html automaticamente (será gerenciado em outra rota)
    }));
  }
  
  // 2. Servir também diretamente de dist/ como fallback
  console.log(`Servindo arquivos estáticos também de: ${distDir}`);
  app.use(express.static(distDir, { 
    maxAge: '1d',    // Cache de 1 dia para arquivos estáticos
    index: false     // Não servir index.html automaticamente (será gerenciado em outra rota)
  }));
  
  // 2.1 Verificar se existe o index-clean.html (versão com URLs simplificadas)
  const cleanIndexPath = join(distDir, 'index-clean.html');
  if (fs.existsSync(cleanIndexPath)) {
    console.log('✅ Encontrado index-clean.html com URLs sem hash');
  }
  
  // 3. Rota específica para assets que lida com diferentes formatos de URL
  app.get(['/assets/*', '*/assets/*'], (req, res, next) => {
    console.log(`⏳ Requisição para asset: ${req.path}`);
    
    // 1. Verificar primeiro se o caminho existe no mapeamento
    if (Object.keys(assetMap).length > 0) {
      // Ver se temos um mapeamento para um asset sem hash
      if (assetMap[req.path]) {
        const simplePath = assetMap[req.path];
        console.log(`✅ Asset encontrado no mapeamento: ${req.path} -> ${simplePath}`);
        
        // Obter o caminho sem a barra inicial e servir o arquivo
        const simpleAssetPath = simplePath.startsWith('/') ? simplePath.substring(1) : simplePath;
        const fullPath = join(distDir, simpleAssetPath);
        
        if (fs.existsSync(fullPath)) {
          return res.sendFile(fullPath);
        }
      }
    }
    
    // 2. Se não encontrou no mapeamento, tentar busca direta
    
    // Remover qualquer prefixo do caminho e extrair o nome do arquivo
    const assetPath = req.path.replace(/^.*assets\//, '');
    
    // Extrair nome base e extensão para facilitar a busca
    const fileName = assetPath.split('/').pop();
    const baseName = fileName.replace(/(-[A-Za-z0-9]+)?\.[^.]+$/, '');
    const extension = fileName.split('.').pop();
    
    console.log(`Asset solicitado: ${assetPath} (base: ${baseName}, ext: ${extension})`);
    
    // Verificar se estamos buscando um arquivo sem hash, que pode estar com hash no sistema
    const isNonHashedRequest = !fileName.match(/^([^-]+)-([A-Za-z0-9]+)\.([^.]+)$/);
    
    // Listar todos os caminhos possíveis para o arquivo EXATO
    const possiblePaths = [
      join(distDir, 'assets', assetPath),
      join(publicDir, 'assets', assetPath),
      join(distDir, 'public', 'assets', assetPath),
      join(distDir, assetPath),
      join(publicDir, assetPath),
      // Adicionar suporte para subdiretórios
      ...directoryStructure.distAssets?.map(subdir => 
        join(distDir, 'assets', subdir, assetPath)) || [],
      ...directoryStructure.publicAssets?.map(subdir => 
        join(publicDir, 'assets', subdir, assetPath)) || []
    ];
    
    // 1. Primeiro, tentar encontrar o arquivo exato
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        console.log(`✅ Asset encontrado exatamente em: ${path}`);
        return res.sendFile(path);
      }
    }
    
    console.log(`⚠️ Asset exato não encontrado, procurando por alternativas para: ${assetPath}`);
    
    // 2. Se não encontrou o arquivo exato, procurar por arquivos semelhantes
    try {
      // Padrão para encontrar arquivos como "index-HASH.js" ou "index.js"
      const patternRegex = new RegExp(`^${baseName}(-[A-Za-z0-9]+)?\\.${extension}$`);
      
      // Verificar em dist/assets
      const assetsDir = join(distDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        const matchingFiles = files.filter(file => patternRegex.test(file));
        
        if (matchingFiles.length > 0) {
          const matchPath = join(assetsDir, matchingFiles[0]);
          console.log(`✅ Asset similar encontrado: ${matchingFiles[0]}`);
          return res.sendFile(matchPath);
        }
      }
      
      // Verificar em dist diretamente
      const files = fs.readdirSync(distDir);
      const matchingFiles = files.filter(file => patternRegex.test(file));
      
      if (matchingFiles.length > 0) {
        const matchPath = join(distDir, matchingFiles[0]);
        console.log(`✅ Asset similar encontrado na raiz: ${matchingFiles[0]}`);
        return res.sendFile(matchPath);
      }
      
      // Verificar em public/assets se existir
      const publicAssetsDir = join(publicDir, 'assets'); 
      if (fs.existsSync(publicAssetsDir)) {
        const files = fs.readdirSync(publicAssetsDir);
        const matchingFiles = files.filter(file => patternRegex.test(file));
        
        if (matchingFiles.length > 0) {
          const matchPath = join(publicAssetsDir, matchingFiles[0]);
          console.log(`✅ Asset similar encontrado em public/assets: ${matchingFiles[0]}`);
          return res.sendFile(matchPath);
        }
      }
    } catch (err) {
      console.error(`Erro ao procurar por assets similares: ${err.message}`);
    }
    
    console.log(`❌ Asset não encontrado, nenhuma alternativa: ${assetPath}`);
    next();
  });
  
  // 4. Rota específica para lidar com requisições diretas de JS e CSS
  app.get('*', (req, res, next) => {
    // Pular se já for uma rota de API
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Verificar se é uma solicitação para um arquivo estático (com extensão)
    const fileMatch = req.path.match(/\.([a-zA-Z0-9]+)$/);
    if (fileMatch) {
      const ext = fileMatch[1].toLowerCase();
      const filename = req.path.split('/').pop();
      
      // Logar apenas requisições de arquivos específicos para não poluir o console
      if (['js', 'css', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'woff', 'woff2', 'ttf'].includes(ext)) {
        console.log(`Requisição para arquivo estático: ${req.path} (${ext})`);
      }
      
      // Lista de potenciais localizações para o arquivo
      const pathWithoutLeadingSlash = req.path.startsWith('/') ? req.path.substring(1) : req.path;
      const possibleLocations = [
        // Caminhos completos
        join(distDir, pathWithoutLeadingSlash),
        join(publicDir, pathWithoutLeadingSlash),
        
        // Arquivo solto na raiz
        join(distDir, filename),
        join(publicDir, filename),
        
        // Em assets
        join(distDir, 'assets', filename),
        join(publicDir, 'assets', filename)
      ];
      
      // Verificar cada localização
      for (const location of possibleLocations) {
        if (fs.existsSync(location)) {
          // Logar apenas arquivos importantes
          if (['js', 'css'].includes(ext)) {
            console.log(`✅ Arquivo encontrado em: ${location}`);
          }
          
          // Enviar arquivo com tipo MIME correto
          return res.sendFile(location);
        }
      }
      
      console.log(`❌ Arquivo não encontrado: ${req.path}`);
    }
    
    // Continuar para próxima rota se não for um arquivo estático
    next();
  });
  
  // Rota para index.html (SPA routing)
  app.get('*', (req, res) => {
    // Skip para APIs
    if (req.path.startsWith('/api')) return;
    
    // Preferir a versão sem hash do index se estiver disponível
    const cleanIndexPath = join(distDir, 'index-clean.html');
    
    // Testar múltiplas localizações para o index.html
    const possibleIndexPaths = [
      // Versão com caminhos sem hash (prioridade mais alta)
      cleanIndexPath,
      // Versões normais
      join(publicDir, 'index.html'),  // dist/public/index.html
      join(distDir, 'index.html')     // dist/index.html
    ];
    
    // Procurar o arquivo index.html nas possíveis localizações
    for (const indexPath of possibleIndexPaths) {
      if (fs.existsSync(indexPath)) {
        if (indexPath === cleanIndexPath) {
          console.log(`Servindo página principal otimizada de: ${indexPath}`);
        } else {
          console.log(`Servindo página principal de: ${indexPath}`);
        }
        
        try {
          // Ler o conteúdo do arquivo
          const indexContent = fs.readFileSync(indexPath, 'utf8');
          
          // Verificar se há referências a arquivos com hash
          const hasHashedAssets = /(src|href)="(\/assets\/[^"]+)-[A-Za-z0-9]+\.([^"]+)"/g.test(indexContent);
          
          if (hasHashedAssets) {
            console.log('Índice contém referências a assets com hash dinâmico');
            
            // Inspecionar que o HTML tem o conteúdo correto
            console.log(`Conteúdo HTML (primeiros 500 caracteres): ${indexContent.substring(0, 500)}`);
            
            // Adicionar código de debugging para ver se há erros JavaScript no console
            const debugScript = `
<script>
  console.log('Debug script carregado');
  
  // Capturar erros JavaScript
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Erro Javascript:', message, 'em', source, 'linha:', lineno);
    document.body.innerHTML += '<div style="position:fixed; top:0; left:0; background:#f8d7da; color:#721c24; padding:20px; z-index:9999; width:100%;">' + 
      '<h3>Erro JavaScript detectado:</h3>' +
      '<p>' + message + '</p>' +
      '<p>Em: ' + source + ', linha: ' + lineno + '</p>' +
      '</div>';
    return true;
  };

  // Capturar rejeições de promessas não tratadas
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Promessa rejeitada não tratada:', event.reason);
    document.body.innerHTML += '<div style="position:fixed; top:50px; left:0; background:#f8d7da; color:#721c24; padding:20px; z-index:9999; width:100%;">' + 
      '<h3>Promessa rejeitada não tratada:</h3>' +
      '<p>' + (event.reason ? event.reason.message || String(event.reason) : 'Razão desconhecida') + '</p>' +
      '</div>';
  });
  
  // Adicionar uma interface mínima com links para as principais rotas
  function addMinimalInterface() {
    const rootDiv = document.getElementById('root');
    if (!rootDiv || rootDiv.childElementCount === 0) {
      const debugPanel = document.createElement('div');
      debugPanel.style.cssText = 'position:fixed; top:0; left:0; background:#e2f0ff; color:#0c5460; padding:20px; z-index:9999; width:100%; font-family: Arial, sans-serif;';
      debugPanel.innerHTML = '<h2>Shopee Delivery Partners - Debug Panel</h2>' +
        '<div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:15px;">' +
        '  <a href="/" style="background:#0d6efd; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">Home</a>' +
        '  <a href="/cadastro" style="background:#0d6efd; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">Cadastro</a>' +
        '  <a href="/entrega" style="background:#0d6efd; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">Entrega</a>' +
        '  <a href="/recebedor" style="background:#0d6efd; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">Recebedor</a>' +
        '</div>' +
        '<div id="api-results" style="margin-top:20px; padding:15px; background:#f7f7f9; border-radius:5px;"><h3>API Status:</h3><p>Checando APIs...</p></div>';
      
      // Append antes do root div para não interferir com o React se ele eventualmente inicializar
      rootDiv.parentNode.insertBefore(debugPanel, rootDiv);
      
      // Testar a API para diagnóstico
      setTimeout(function() {
        const apiResultsDiv = document.getElementById('api-results');
        
        // Teste da API de regiões
        apiResultsDiv.innerHTML = '<h3>API Status:</h3><p>Testando API de regiões...</p>';
        
        fetch('/api/regions')
          .then(response => {
            apiResultsDiv.innerHTML += '<p>✅ API /api/regions respondeu com status: ' + response.status + '</p>';
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Erro na resposta da API');
            }
          })
          .then(data => {
            apiResultsDiv.innerHTML += '<p>Dados recebidos: ' + JSON.stringify(data).substring(0, 100) + '...</p>';
          })
          .catch(err => {
            apiResultsDiv.innerHTML += '<p>❌ Erro ao chamar API: ' + err.message + '</p>';
          });
      }, 1000);
    }
  }
  
  // Verificar se o React está carregando
  setTimeout(function() {
    const rootDiv = document.getElementById('root');
    console.log('Verificando renderização do React. Root encontrado:', !!rootDiv);
    
    if (!rootDiv || rootDiv.childElementCount === 0) {
      console.warn('React não renderizou conteúdo após 3 segundos');
      
      document.body.innerHTML += '<div style="position:fixed; top:0; left:0; background:#fff3cd; color:#856404; padding:20px; z-index:9999; width:100%;">' + 
        '<h3>Aviso:</h3>' +
        '<p>A aplicação React não renderizou nenhum conteúdo. Verificando estado do DOM.</p>' +
        '<p>Elementos no body: ' + document.body.childElementCount + '</p>' +
        '<p>Elementos no #root: ' + (rootDiv ? rootDiv.childElementCount : 'elemento root não encontrado') + '</p>' +
        '</div>';
      
      // Adicionar interface mínima de navegação e diagnóstico
      addMinimalInterface();
      
      // Verificar scripts carregados
      const scripts = document.getElementsByTagName('script');
      let scriptInfo = 'Scripts carregados:<br>';
      for (let i=0; i < Math.min(scripts.length, 5); i++) {
        scriptInfo += '- ' + (scripts[i].src || 'inline script') + '<br>';
      }
      if (scripts.length > 5) {
        scriptInfo += `... e mais ${scripts.length - 5} scripts`;
      }
      
      document.body.innerHTML += '<div style="position:fixed; bottom:10px; right:10px; background:#f8f9fa; padding:15px; border:1px solid #ddd; border-radius:5px;">' + scriptInfo + '</div>';
    }
  }, 3000);
</script>`;
            
            // Processar o HTML para modificar referências a assets com hash
            let processedHtml = fixAssetReferences(indexContent, distDir);
            
            // Corrigir problemas conhecidos com scripts module
            processedHtml = processedHtml.replace(
              /<script type="module" crossorigin src="\/assets\/([^"]+)"><\/script>/g,
              '<script type="module" crossorigin src="/assets/$1" onerror="console.error(\'Erro ao carregar script module\', this.src)"></script>'
            );
            
            // Adicionar scripts de fallback para lidar com problemas comuns
            const fallbackScript = `
<script>
// Verificar se o script principal foi carregado corretamente
window.reactLoaded = false;

// Fallback para carregar o script principal manualmente se necessário
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se o React foi carregado após 1 segundo
  setTimeout(function() {
    if (!window.reactLoaded) {
      console.warn('React não foi inicializado após 1 segundo, tentando alternativas');
      
      // 1. Primeiro: tentar recarregar o script principal
      var mainScript = document.querySelector('script[src*="index-"]');
      if (mainScript) {
        console.log('Tentativa 1: Recarregando script principal:', mainScript.src);
        
        var newScript = document.createElement('script');
        newScript.src = mainScript.src.split('?')[0] + '?' + new Date().getTime(); // Evitar cache
        newScript.type = 'text/javascript';
        newScript.async = false; // Forçar carregamento síncrono
        document.body.appendChild(newScript);
      }
      
      // 2. Carregar bibliotecas React diretamente de CDN como fallback
      setTimeout(function() {
        if (!window.reactLoaded) {
          console.log('Tentativa 2: Carregando React diretamente de CDN');
          
          var reactScript = document.createElement('script');
          reactScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js';
          reactScript.crossOrigin = '';
          
          var reactDomScript = document.createElement('script');
          reactDomScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
          reactDomScript.crossOrigin = '';
          
          reactScript.onload = function() {
            document.body.appendChild(reactDomScript);
          };
          
          reactDomScript.onload = function() {
            console.log('React e ReactDOM carregados de CDN');
            
            // 3. Tentar inicializar React manualmente
            setTimeout(function() {
              if (!window.reactLoaded && document.getElementById('root')) {
                console.log('Tentativa 3: Inicializando React manualmente');
                
                // Criar um componente React mínimo
                var rootElement = document.getElementById('root');
                rootElement.innerHTML = '';
                
                // Mostrar uma mensagem dentro do elemento root
                var fallbackElement = document.createElement('div');
                fallbackElement.style.cssText = 'padding:20px; text-align:center; font-family:system-ui,sans-serif;';
                fallbackElement.innerHTML = '<h1>Shopee Delivery Partners</h1>' +
                  '<p>O aplicativo está carregando em modo alternativo.</p>' +
                  '<div id="fallback-loading" style="margin:20px 0; padding:15px; border-radius:4px; background:#f8f9fa;">Carregando...</div>' +
                  '<div style="margin:20px auto; max-width:600px;">' +
                  '  <a href="/" style="display:inline-block; padding:10px 20px; background:#ee4d2d; color:white; text-decoration:none; border-radius:4px; margin:0 10px;">Início</a>' +
                  '  <a href="/cadastro" style="display:inline-block; padding:10px 20px; background:#ee4d2d; color:white; text-decoration:none; border-radius:4px; margin:0 10px;">Cadastro</a>' +
                  '</div>';
                
                rootElement.appendChild(fallbackElement);
                
                // Tentar carregar dados da API
                var loadingElement = document.getElementById('fallback-loading');
                fetch('/api/regions')
                  .then(function(response) { return response.json(); })
                  .then(function(data) {
                    loadingElement.innerHTML = '<div style="color:green">✓ API conectada com sucesso!</div>';
                  })
                  .catch(function(error) {
                    loadingElement.innerHTML = '<div style="color:red">✗ Erro ao conectar à API: ' + error.message + '</div>';
                  });
              }
            }, 1000);
          };
          
          document.body.appendChild(reactScript);
        }
      }, 2000);
    }
  }, 1000);
});

// Monitorar carregamento de React
setInterval(function() {
  if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined' && !window.reactLoaded) {
    console.log('React detectado como carregado!');
    window.reactLoaded = true;
  }
}, 500);
</script>`;
            
            // Inserir os scripts antes do fechamento do </body>
            processedHtml = processedHtml.replace('</body>', fallbackScript + debugScript + '</body>');
            
            // Adicionar meta tag para resolver problemas de cache
            processedHtml = processedHtml.replace(
              '<head>',
              '<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\n    <meta http-equiv="Pragma" content="no-cache" />\n    <meta http-equiv="Expires" content="0" />'
            );
            
            // Enviar o HTML processado
            res.set('Content-Type', 'text/html');
            return res.send(processedHtml);
          }
          
          // Se não tem referências com hash, enviar o arquivo diretamente
          return res.sendFile(indexPath);
        } catch (e) {
          console.warn(`Erro ao ler/processar o arquivo ${indexPath}:`, e.message);
          // Continuar e tentar o próximo arquivo
        }
      }
    }
    
    // Se não encontrar o index.html em nenhum lugar
    console.log(`⚠️ Não foi possível encontrar index.html. Procurado em: ${possibleIndexPaths.join(', ')}`);
    res.status(404).send('Página não encontrada - index.html não encontrado');
  });
}

// ========================
// Iniciar o servidor
// ========================
async function startServer() {
  try {
    console.log('Iniciando servidor...');
    
    // Configurar rotas da API
    const server = await setupApiRoutes();
    
    // Configurar middleware para servir arquivos estáticos
    serveStaticFiles();
    
    // Middleware para tratamento de erros
    app.use((err, _req, res, _next) => {
      console.error('Erro na aplicação:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Erro interno do servidor";
      res.status(status).json({ message });
    });

    // Iniciar servidor na porta fornecida pelo Heroku
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
    });

    // Tratar desligamento gracioso
    process.on('SIGTERM', () => {
      console.log('Sinal SIGTERM recebido: fechando servidor HTTP');
      server.close(() => {
        console.log('Servidor HTTP fechado');
      });
    });
  } catch (error) {
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar o servidor
startServer();