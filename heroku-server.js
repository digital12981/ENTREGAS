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
  if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
    const fileName = path.basename(req.path);
    const possiblePaths = [
      path.join(STATIC_DIR, 'assets', fileName),
      path.join(STATIC_DIR, fileName)
    ];
    
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        console.log(`Redirecting ${req.path} to found file at ${filePath}`);
        return res.sendFile(filePath);
      }
    }
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
    return res.status(404).send('index.html not found');
  }
  
  // Ler e modificar o index.html para usar caminhos relativos
  try {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Substituir caminhos absolutos por relativos
    html = html.replace(/src="\/assets\//g, 'src="assets/');
    html = html.replace(/href="\/assets\//g, 'href="assets/');
    
    // Adicionar meta tag de debug
    html = html.replace('</head>', 
      '<!-- Heroku optimized version -->\n' +
      '<meta name="heroku-version" content="1.0">\n' +
      '</head>'
    );
    
    // Remover a tag base se existir
    html = html.replace(/<base href="\/"[^>]*>/, '');
    
    // Adicionar script para detectar falhas de carregamento
    html = html.replace('</body>', `
      <script>
        // Monitorar falhas de carregamento de recursos
        window.addEventListener('error', function(e) {
          if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
            console.error('Resource failed to load:', e.target.src || e.target.href);
            
            // Tentar caminhos alternativos
            const src = e.target.src || e.target.href;
            if (src && src.includes('/assets/')) {
              const newSrc = src.replace('/assets/', 'assets/');
              console.log('Trying alternative path:', newSrc);
              if (e.target.tagName === 'SCRIPT') {
                e.target.src = newSrc;
              } else {
                e.target.href = newSrc;
              }
            }
          }
        }, true);
      </script>
    </body>`);
    
    // Enviar HTML modificado
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(`Error processing index.html: ${err.message}`);
    res.sendFile(indexPath); // Fallback para o arquivo original
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