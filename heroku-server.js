import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import compression from 'compression';
import cors from 'cors';

// Obter o diretório atual em contexto de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração
const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.join(__dirname, 'dist', 'public');

// Inicializar o Express
const app = express();

// Middlewares essenciais
app.use(cors());
app.use(compression());
app.use(express.json());

// Verificar se o diretório de arquivos estáticos existe
if (fs.existsSync(STATIC_DIR)) {
  console.log('Static directory exists!');
  
  // Listar arquivos no diretório estático
  const files = fs.readdirSync(STATIC_DIR);
  console.log(`Files in static directory: ${files.join(', ')}`);
  
  // Verificar subdiretório de assets
  const assetsDir = path.join(STATIC_DIR, 'assets');
  if (fs.existsSync(assetsDir)) {
    console.log('Assets directory exists!');
    const assetFiles = fs.readdirSync(assetsDir);
    console.log(`Files in assets directory: ${assetFiles.join(', ')}`);
  } else {
    console.log('Assets directory does not exist!');
  }
} else {
  console.log(`Static directory does not exist at ${STATIC_DIR}`);
}

// Middleware para log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Servir arquivos estáticos, com preferência para o diretório 'assets'
app.use('/assets', express.static(path.join(STATIC_DIR, 'assets'), {
  maxAge: '1d'
}));

// Para requisições diretas a arquivos CSS ou JS que não encontraram no caminho absoluto
app.use((req, res, next) => {
  // Primeiro, registrar todas as requisições para ajudar no debug
  console.log(`Request for: ${req.method} ${req.path} (${req.headers['user-agent'] || 'Unknown Agent'})`);
  
  // Se for uma requisição para um arquivo específico (não apenas uma rota)
  if (req.path.includes('.')) {
    const fileName = path.basename(req.path);
    const fileExt = path.extname(req.path).toLowerCase();
    
    // Lista de possíveis localizações para o arquivo
    const possiblePaths = [
      path.join(STATIC_DIR, req.path.startsWith('/') ? req.path.substring(1) : req.path),
      path.join(STATIC_DIR, 'assets', fileName),
      path.join(STATIC_DIR, fileName)
    ];
    
    // Tentar encontrar o arquivo em qualquer uma das localizações
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        console.log(`Found file at: ${filePath}, serving directly`);
        
        // Adicionar cabeçalhos de cache apropriados com base no tipo de arquivo
        if (['.js', '.css'].includes(fileExt)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(fileExt)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
        
        return res.sendFile(filePath);
      }
    }
    
    // Apenas para arquivos js/css, fazemos uma pesquisa mais ampla se não encontrar o arquivo exato
    if (['.js', '.css'].includes(fileExt)) {
      const assetsDir = path.join(STATIC_DIR, 'assets');
      
      if (fs.existsSync(assetsDir)) {
        const assetFiles = fs.readdirSync(assetsDir);
        
        // Procurar por qualquer arquivo com o mesmo nome base
        const baseName = path.basename(fileName, fileExt);
        const pattern = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*\\${fileExt}$`);
        
        const matchingFiles = assetFiles.filter(file => pattern.test(file));
        
        if (matchingFiles.length > 0) {
          console.log(`Found similar file: ${matchingFiles[0]}, using as fallback`);
          return res.sendFile(path.join(assetsDir, matchingFiles[0]));
        }
      }
    }
    
    // Se chegou aqui e não encontrou o arquivo, registrar isso
    console.log(`File not found in any location: ${req.path}`);
  }
  
  next();
});

// Servir arquivos estáticos do diretório principal
app.use(express.static(STATIC_DIR, {
  index: false // Desabilitar o comportamento padrão de index.html
}));

// Rota específica para index.html
app.get('/', (req, res) => {
  const indexPath = path.join(STATIC_DIR, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error(`index.html not found at path: ${indexPath}`);
    return res.status(404).send('index.html not found');
  }
  
  // Ler e modificar o index.html para usar caminhos relativos
  try {
    console.log(`Reading index.html from ${indexPath}`);
    let html = fs.readFileSync(indexPath, 'utf8');
    console.log(`Successfully read index.html, length: ${html.length} bytes`);
    
    // Fazer um backup do HTML original para debug
    const debugDirPath = path.join(__dirname, 'debug');
    if (!fs.existsSync(debugDirPath)) {
      fs.mkdirSync(debugDirPath, { recursive: true });
    }
    fs.writeFileSync(path.join(debugDirPath, 'original.html'), html);
    
    // Extrair e logar referências de assets no HTML original
    const scriptMatches = html.match(/<script[^>]*src="([^"]+)"[^>]*>/g) || [];
    const cssMatches = html.match(/<link[^>]*href="([^"]+)"[^>]*>/g) || [];
    
    console.log('Scripts found in HTML:');
    scriptMatches.forEach(match => {
      const src = match.match(/src="([^"]+)"/);
      if (src && src[1]) console.log(`- ${src[1]}`);
    });
    
    console.log('CSS links found in HTML:');
    cssMatches.forEach(match => {
      const href = match.match(/href="([^"]+)"/);
      if (href && href[1]) console.log(`- ${href[1]}`);
    });
    
    // Substituir caminhos absolutos por relativos
    const originalHtml = html;
    html = html.replace(/src="\/assets\//g, 'src="./assets/');
    html = html.replace(/href="\/assets\//g, 'href="./assets/');
    
    if (html !== originalHtml) {
      console.log('Paths were modified to relative');
    } else {
      console.log('No absolute paths were found to modify');
    }
    
    // Adicionar meta tag de debug e remover base tag
    html = html.replace('</head>', 
      '<!-- Heroku optimized version -->\n' +
      '<meta name="heroku-version" content="1.1">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">\n' +
      '</head>'
    );
    
    // Remover a tag base se existir
    const originalWithBase = html;
    html = html.replace(/<base[^>]*>/, '');
    
    if (html !== originalWithBase) {
      console.log('Base tag was removed');
    }
    
    // Criar versão inline de CSS para garantir estilo básico mesmo sem assets carregados
    const inlineCSS = `
      <style>
        /* Estilos básicos de fallback */
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .notice { background: #f8f9fa; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .loading { font-size: 20px; text-align: center; margin-top: 50px; }
      </style>
    `;
    
    html = html.replace('</head>', inlineCSS + '</head>');
    
    // Adicionar script para detectar e corrigir falhas de carregamento + diagnóstico
    html = html.replace('</body>', `
      <div id="loading-status" class="loading">Carregando conteúdo...</div>
      
      <script>
        // Status element para feedback visual
        const statusEl = document.getElementById('loading-status');
        const rootEl = document.getElementById('root');
        
        // Ocultar o root inicialmente
        if (rootEl) rootEl.style.display = 'none';
        
        // Log para diagnóstico
        console.log('Heroku optimized loader running');
        
        // Contador de recursos
        let totalResources = 0;
        let loadedResources = 0;
        let failedResources = 0;
        
        // Monitorar todos os scripts e CSS na página
        document.querySelectorAll('script[src], link[rel="stylesheet"]').forEach(el => {
          const src = el.src || el.href;
          if (src) {
            totalResources++;
            console.log('Resource to monitor:', src);
          }
        });
        
        statusEl.textContent = 'Carregando recursos (' + loadedResources + '/' + totalResources + ')';
        
        // Monitorar falhas de carregamento
        window.addEventListener('error', function(e) {
          if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
            failedResources++;
            const src = e.target.src || e.target.href;
            console.error('Resource failed to load:', src);
            
            statusEl.textContent = 'Erro ao carregar recurso. Tentando alternativa...';
            
            // Tentar caminhos alternativos
            if (src) {
              let newSrc = src;
              
              if (src.startsWith('/assets/')) {
                newSrc = src.replace('/assets/', './assets/');
              } else if (src.includes('/assets/')) {
                newSrc = src.replace('/assets/', 'assets/');
              } else if (src.startsWith('/')) {
                newSrc = '.' + src;
              }
              
              if (newSrc !== src) {
                console.log('Trying alternative path:', newSrc);
                if (e.target.tagName === 'SCRIPT') {
                  e.target.src = newSrc;
                } else {
                  e.target.href = newSrc;
                }
              }
            }
          }
        }, true);
        
        // Detectar quando recursos carregam
        function resourceLoaded() {
          loadedResources++;
          statusEl.textContent = 'Carregando recursos (' + loadedResources + '/' + totalResources + ')';
          
          if (loadedResources >= totalResources - failedResources) {
            console.log('All resources loaded or handled');
            
            // Remover o status e mostrar o conteúdo
            setTimeout(() => {
              if (rootEl) rootEl.style.display = '';
              statusEl.style.display = 'none';
            }, 500);
          }
        }
        
        // Monitorar carregamento de recursos
        document.querySelectorAll('script[src]').forEach(script => {
          script.onload = resourceLoaded;
          script.onerror = () => {
            console.error('Script failed to load:', script.src);
          };
        });
        
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
          link.onload = resourceLoaded;
          link.onerror = () => {
            console.error('Stylesheet failed to load:', link.href);
          };
        });
        
        // Fallback para casos onde não conseguimos detectar o carregamento
        setTimeout(() => {
          console.log('Timeout fallback triggered');
          if (rootEl) rootEl.style.display = '';
          statusEl.style.display = 'none';
        }, 5000);
      </script>
    </body>`);
    
    // Salvar versão modificada para debug
    fs.writeFileSync(path.join(debugDirPath, 'modified.html'), html);
    
    // Enviar HTML modificado
    console.log('Sending modified HTML to client');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(`Error processing index.html: ${err.message}`);
    console.error(err.stack);
    // Fallback para o arquivo original em caso de erro
    res.sendFile(indexPath);
  }
});

// SPA fallback - serve index.html para todas as rotas não-arquivo
app.get('*', (req, res) => {
  // Se a URL não parece ser um arquivo
  if (!req.path.includes('.')) {
    res.redirect('/');
  } else {
    res.status(404).send('Not found');
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});