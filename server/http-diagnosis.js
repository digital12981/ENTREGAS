/**
 * Módulo para diagnosticar problemas de servir arquivos HTTP
 * Adiciona endpoints de diagnóstico sem interferir no funcionamento normal da aplicação
 */

import fs from 'fs';
import path from 'path';

/**
 * Configura endpoints de diagnóstico HTTP para a aplicação
 * @param {import('express').Express} app - Aplicação Express
 */
export function setupHttpDiagnosis(app) {
  // Endpoint para examinar a estrutura do sistema de arquivos
  app.get('/_fs-diagnosis', (req, res) => {
    try {
      // Informações do ambiente
      const envInfo = {
        nodeEnv: process.env.NODE_ENV,
        currentDir: process.cwd(),
        dirname: __dirname,
        platform: process.platform,
        hostname: req.hostname,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        headers: req.headers
      };
      
      // Função para verificar um diretório específico
      const checkDirectory = (dirPath) => {
        try {
          const exists = fs.existsSync(dirPath);
          
          if (!exists) {
            return {
              path: dirPath,
              exists: false,
              error: 'Directory does not exist'
            };
          }
          
          const stats = fs.statSync(dirPath);
          
          if (!stats.isDirectory()) {
            return {
              path: dirPath,
              exists: true,
              isDirectory: false,
              error: 'Path exists but is not a directory'
            };
          }
          
          const files = fs.readdirSync(dirPath);
          const hasIndexHtml = fs.existsSync(path.join(dirPath, 'index.html'));
          const hasAssets = fs.existsSync(path.join(dirPath, 'assets'));
          
          // Obter informações sobre os arquivos de assets
          let assetsInfo = null;
          if (hasAssets) {
            try {
              const assetsPath = path.join(dirPath, 'assets');
              const assetFiles = fs.readdirSync(assetsPath);
              const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
              const cssFiles = assetFiles.filter(f => f.endsWith('.css'));
              
              assetsInfo = {
                path: assetsPath,
                fileCount: assetFiles.length,
                files: assetFiles,
                hasJsFiles: jsFiles.length > 0,
                hasCssFiles: cssFiles.length > 0,
                jsFiles,
                cssFiles
              };
            } catch (err) {
              assetsInfo = {
                error: `Error reading assets directory: ${err.message}`
              };
            }
          }
          
          return {
            path: dirPath,
            exists: true,
            isDirectory: true,
            fileCount: files.length,
            files: files.slice(0, 20),
            hasIndexHtml,
            hasAssets,
            assetsInfo
          };
        } catch (err) {
          return {
            path: dirPath,
            error: `Error checking directory: ${err.message}`
          };
        }
      };
      
      // Verificar caminhos que podem conter arquivos estáticos
      const paths = [
        path.resolve(process.cwd()),                               // /app
        path.resolve(process.cwd(), 'public'),                     // /app/public
        path.resolve(process.cwd(), 'dist', 'public'),             // /app/dist/public  
        path.resolve(process.cwd(), 'dist', 'client'),             // /app/dist/client
        path.resolve(__dirname),                                  // /app/dist/server
        path.resolve(__dirname, 'public'),                        // /app/dist/server/public
        path.resolve(__dirname, '..', 'public'),                  // /app/dist/public
        path.resolve(__dirname, '..', 'client'),                  // /app/dist/client
        path.resolve(__dirname, '..', '..', 'public'),            // /app/public
      ];
      
      // Verificar cada caminho
      const pathResults = paths.map(p => checkDirectory(p));
      
      // Preparar informações sobre a requisição atual
      const requestInfo = {
        method: req.method,
        url: req.url,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        path: req.path,
        hostname: req.hostname,
        ip: req.ip,
        headers: req.headers
      };
      
      // Exemplo de análise de HTML
      let htmlSample = null;
      try {
        // Encontrar um caminho com index.html
        const dirWithHtml = pathResults.find(p => p.hasIndexHtml);
        if (dirWithHtml) {
          const htmlPath = path.join(dirWithHtml.path, 'index.html');
          const htmlContent = fs.readFileSync(htmlPath, 'utf8');
          const firstLines = htmlContent.split('\\n').slice(0, 20).join('\\n');
          
          // Extrair referências a arquivos JS e CSS
          const jsMatch = htmlContent.match(/src="([^"]+\.js)"/g) || [];
          const cssMatch = htmlContent.match(/href="([^"]+\.css)"/g) || [];
          
          htmlSample = {
            path: htmlPath,
            size: htmlContent.length,
            preview: firstLines,
            jsReferences: jsMatch.map(m => m.match(/src="([^"]+)"/)[1]),
            cssReferences: cssMatch.map(m => m.match(/href="([^"]+)"/)[1])
          };
        }
      } catch (err) {
        htmlSample = {
          error: `Error getting HTML sample: ${err.message}`
        };
      }
      
      res.json({
        timestamp: new Date().toISOString(),
        environment: envInfo,
        request: requestInfo,
        directoriesChecked: pathResults,
        htmlSample
      });
    } catch (error) {
      res.status(500).json({
        error: `Diagnóstico falhou: ${error.message}`,
        stack: error.stack
      });
    }
  });
  
  // Endpoint para receber informações do navegador
  app.post('/_browser-info', (req, res) => {
    const browserInfo = req.body || {};
    console.log('Informações do navegador:', JSON.stringify(browserInfo, null, 2));
    res.json({ received: true, timestamp: new Date().toISOString() });
  });
  
  // Endpoint para testar servir um arquivo específico
  app.get('/_serve-test/:file', (req, res) => {
    const fileName = req.params.file;
    
    // Verificar vários caminhos possíveis
    const possiblePaths = [
      path.resolve(process.cwd(), 'public', fileName),
      path.resolve(process.cwd(), 'public', 'assets', fileName),
      path.resolve(process.cwd(), 'dist', 'public', fileName),
      path.resolve(process.cwd(), 'dist', 'public', 'assets', fileName),
      path.resolve(process.cwd(), 'dist', 'client', fileName),
      path.resolve(process.cwd(), 'dist', 'client', 'assets', fileName),
      path.resolve(__dirname, 'public', fileName),
      path.resolve(__dirname, 'public', 'assets', fileName),
      path.resolve(__dirname, '..', 'public', fileName),
      path.resolve(__dirname, '..', 'public', 'assets', fileName),
    ];
    
    // Encontrar o primeiro caminho válido
    let foundPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        foundPath = testPath;
        break;
      }
    }
    
    // Responder de acordo
    if (foundPath) {
      res.sendFile(foundPath);
    } else {
      res.status(404).json({
        error: `Arquivo ${fileName} não encontrado`,
        searchedPaths: possiblePaths
      });
    }
  });
  
  console.log('Módulo de diagnóstico HTTP configurado. Endpoints disponíveis:');
  console.log('- GET /_fs-diagnosis - Examina a estrutura do sistema de arquivos');
  console.log('- POST /_browser-info - Recebe informações do navegador');
  console.log('- GET /_serve-test/:file - Testa servir um arquivo específico');
}