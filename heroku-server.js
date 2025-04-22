// Servidor Express especialmente configurado para o Heroku
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir acesso de qualquer origem
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Configuração para servir arquivos estáticos
const staticOptions = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['htm', 'html'],
  index: 'index.html',
  maxAge: '1d',
  setHeaders: function (res, path) {
    // Configurar headers específicos para diferentes tipos de arquivos
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (path.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
};

// Caminho para os arquivos estáticos
const staticPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(staticPath, staticOptions));

// Importa as rotas da API
import { registerRoutes } from './dist/index.js';

// Registra as rotas da API
(async () => {
  try {
    const server = await registerRoutes(app);
    
    // Para qualquer rota não encontrada, serve o index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(staticPath, 'index.html'));
    });
    
    server.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
})();