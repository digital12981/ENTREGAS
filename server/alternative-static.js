/**
 * Módulo alternativo para servir arquivos estáticos
 * 
 * Este módulo fornece uma implementação alternativa para servir
 * arquivos estáticos caso a implementação padrão não esteja funcionando
 * no ambiente de produção.
 */

import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Função para log de mensagens formatadas
 */
function log(message, level = 'info') {
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  
  const prefix = `${formattedTime} [static-alt]`;
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ERROR: ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} WARN: ${message}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

/**
 * Configuração alternativa para servir arquivos estáticos
 * @param {express.Express} app - Instância do Express
 */
export function setupAlternativeStatic(app) {
  log('Configurando serviço alternativo de arquivos estáticos');
  
  // Verificar múltiplos locais possíveis de arquivos estáticos
  const possiblePaths = [
    path.resolve(__dirname, 'public'),            // server/public
    path.resolve(__dirname, '..', 'public'),      // public/ (na raiz)
    path.resolve(__dirname, '..', 'dist', 'client'), // dist/client
    path.resolve('/app/public')                   // /app/public (caminho absoluto na Heroku)
  ];
  
  // Copiar arquivos para todos os caminhos possíveis primeiro
  const rootDir = path.resolve(__dirname, '..');
  const publicDir = path.resolve(rootDir, 'public');
  
  if (fs.existsSync(publicDir)) {
    // Copiar para todos os outros caminhos possíveis
    possiblePaths.forEach(testPath => {
      if (testPath !== publicDir && !fs.existsSync(testPath)) {
        log(`Criando diretório ${testPath}...`);
        fs.mkdirSync(testPath, { recursive: true });
      }
      
      if (testPath !== publicDir && fs.existsSync(testPath)) {
        try {
          // Copiar index.html
          if (fs.existsSync(path.join(publicDir, 'index.html'))) {
            fs.copyFileSync(
              path.join(publicDir, 'index.html'), 
              path.join(testPath, 'index.html')
            );
            log(`Copiado index.html para ${testPath}`);
          }
          
          // Copiar favicon.ico
          if (fs.existsSync(path.join(publicDir, 'favicon.ico'))) {
            fs.copyFileSync(
              path.join(publicDir, 'favicon.ico'), 
              path.join(testPath, 'favicon.ico')
            );
            log(`Copiado favicon.ico para ${testPath}`);
          }
          
          // Copiar diretório assets
          const srcAssetsDir = path.join(publicDir, 'assets');
          const destAssetsDir = path.join(testPath, 'assets');
          
          if (fs.existsSync(srcAssetsDir)) {
            if (!fs.existsSync(destAssetsDir)) {
              fs.mkdirSync(destAssetsDir, { recursive: true });
            }
            
            // Copiar arquivos
            const assetFiles = fs.readdirSync(srcAssetsDir);
            assetFiles.forEach(file => {
              const srcFile = path.join(srcAssetsDir, file);
              const destFile = path.join(destAssetsDir, file);
              
              if (fs.statSync(srcFile).isFile()) {
                fs.copyFileSync(srcFile, destFile);
              }
            });
            
            log(`Copiados ${assetFiles.length} arquivos de assets para ${destAssetsDir}`);
          }
        } catch (err) {
          log(`Erro ao copiar arquivos para ${testPath}: ${err.message}`, 'error');
        }
      }
    });
  }
  
  // Encontrar todos os caminhos válidos
  const validPaths = possiblePaths.filter(testPath => {
    const exists = fs.existsSync(testPath);
    if (exists) {
      const hasIndexHtml = fs.existsSync(path.join(testPath, 'index.html'));
      log(`Diretório ${testPath} ${hasIndexHtml ? 'contém' : 'NÃO contém'} index.html`);
      return hasIndexHtml;
    }
    return false;
  });
  
  if (validPaths.length === 0) {
    log('AVISO: Nenhum diretório válido encontrado com index.html', 'warn');
    
    // Em produção, continuar mesmo sem arquivos válidos
    // (talvez eles sejam criados posteriormente)
    if (process.env.NODE_ENV === 'production') {
      const defaultPath = path.resolve(__dirname, '..', 'public');
      log(`Usando caminho padrão mesmo sem confirmar: ${defaultPath}`, 'warn');
      
      // Tentar criar o diretório se não existir
      if (!fs.existsSync(defaultPath)) {
        log(`Criando diretório ${defaultPath}...`);
        try {
          fs.mkdirSync(defaultPath, { recursive: true });
        } catch (err) {
          log(`Erro ao criar diretório: ${err.message}`, 'error');
        }
      }
      
      // Configurar middleware
      app.use(express.static(defaultPath));
      
      // Em produção, registrar middleware de fallback que verifica múltiplos caminhos
      app.use('*', (req, res, next) => {
        // Para rotas da API, passar para o próximo handler
        if (req.originalUrl.startsWith('/api/')) {
          return next();
        }
        
        // Verificar novamente todos os possíveis caminhos em tempo real
        for (const testPath of possiblePaths) {
          const indexPath = path.join(testPath, 'index.html');
          if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
          }
        }
        
        // Se ainda não encontrou, tentar um fallback na raiz
        const rootIndex = path.resolve(__dirname, '..', 'index.html');
        if (fs.existsSync(rootIndex)) {
          return res.sendFile(rootIndex);
        }
        
        // Último recurso: criar um HTML básico
        res.status(500).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Shopee Entregas</title>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              h1 { color: #ee4d2d; }
              .error { color: #e74c3c; margin: 20px 0; padding: 15px; border: 1px solid #e74c3c; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>Shopee Entregas</h1>
            <div class="error">
              <p><strong>Erro:</strong> Não foi possível carregar a interface. Por favor, tente novamente mais tarde.</p>
              <p><em>Erro técnico: Arquivos estáticos não encontrados</em></p>
            </div>
          </body>
          </html>
        `);
      });
    } else {
      // Em desenvolvimento, lançar erro
      log('Não foi possível encontrar diretório válido para arquivos estáticos', 'error');
    }
  } else {
    // Em qualquer ambiente, usar o primeiro caminho válido encontrado
    const staticPath = validPaths[0];
    log(`Servindo arquivos estáticos de: ${staticPath}`);
    
    // Configurar middleware
    app.use(express.static(staticPath));
    
    // Fallback para index.html
    app.use('*', (req, res, next) => {
      // Para rotas da API, passar para o próximo handler
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  }
  
  // Registrar middleware de diagnóstico para ajudar a depurar problemas
  app.get('/_static-diagnosis', (req, res) => {
    // Verificar todos os caminhos possíveis em tempo real
    const diagnosis = possiblePaths.map(testPath => {
      const exists = fs.existsSync(testPath);
      const hasIndexHtml = exists && fs.existsSync(path.join(testPath, 'index.html'));
      const files = exists ? fs.readdirSync(testPath).slice(0, 10) : [];
      
      return {
        path: testPath,
        exists,
        hasIndexHtml,
        fileCount: exists ? fs.readdirSync(testPath).length : 0,
        sampleFiles: files
      };
    });
    
    // Informações de ambiente
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      currentDir: process.cwd(),
      dirname: __dirname,
      hostname: req.hostname,
      heroku: process.env.PORT ? true : false
    };
    
    res.json({
      timestamp: new Date().toISOString(),
      environment,
      paths: diagnosis
    });
  });
  
  log('Configuração alternativa de arquivos estáticos concluída');
}