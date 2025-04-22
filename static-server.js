// Servidor estático exclusivo para servir o frontend
import express from 'express';
import path from 'path';
import compression from 'compression';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Compatibilidade para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Compressão para melhorar performance
app.use(compression());

// Logs para depuração
console.log(`Static server starting...`);
console.log(`Current directory: ${process.cwd()}`);

const staticPath = path.join(process.cwd(), 'dist', 'public');
console.log(`Using static path: ${staticPath}`);

// Verificar se o diretório existe
if (fs.existsSync(staticPath)) {
  console.log(`Static directory exists!`);
  const files = fs.readdirSync(staticPath);
  console.log(`Files in static directory: ${files.join(', ')}`);
  
  const assetsPath = path.join(staticPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    console.log(`Assets directory exists!`);
    const assetFiles = fs.readdirSync(assetsPath);
    console.log(`Files in assets directory: ${assetFiles.join(', ')}`);
  } else {
    console.log(`Assets directory does NOT exist!`);
  }
} else {
  console.error(`Static directory does NOT exist!`);
}

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Monitoramento de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configurações para arquivos estáticos
const staticOptions = {
  maxAge: '30d',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (path.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
};

// Servir arquivos estáticos com alta prioridade para /assets
app.use('/assets', express.static(path.join(staticPath, 'assets'), {
  maxAge: '1y',
  etag: true
}));

// Servir outros arquivos estáticos
app.use(express.static(staticPath, staticOptions));

// Rota específica para index.html
app.get('/', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log(`Serving index.html from ${indexPath}`);
    res.sendFile(indexPath);
  } else {
    console.error(`index.html not found at ${indexPath}`);
    res.status(404).send('index.html not found');
  }
});

// Para qualquer outra rota, serve o index.html (SPA)
app.get('*', (req, res) => {
  if (!req.url.includes('.')) {  // apenas para rotas que não são arquivos
    res.sendFile(path.join(staticPath, 'index.html'));
  } else {
    res.status(404).send('File not found');
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
});