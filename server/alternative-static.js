/**
 * Módulo alternativo para servir arquivos estáticos
 * 
 * Este módulo fornece uma implementação alternativa para servir
 * arquivos estáticos caso a implementação padrão não esteja funcionando
 * no ambiente de produção.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuração alternativa para servir arquivos estáticos
 * @param {express.Express} app - Instância do Express
 */
export function setupAlternativeStatic(app) {
  console.log('[AlternativeStatic] Configurando serviço alternativo de arquivos estáticos...');
  
  // Lista de possíveis diretórios de arquivos estáticos em ordem de prioridade
  const possibleStaticDirs = [
    path.resolve(process.cwd(), 'public'),
    path.resolve(process.cwd(), 'dist/client'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(__dirname, '..', 'public'),
    path.resolve(__dirname, '..', 'dist/client'),
    path.resolve(__dirname, '..', 'dist')
  ];
  
  // Encontrar o primeiro diretório que existe e contém index.html
  let staticDir = null;
  
  for (const dir of possibleStaticDirs) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
      staticDir = dir;
      console.log(`[AlternativeStatic] Diretório de arquivos estáticos encontrado: ${staticDir}`);
      break;
    }
  }
  
  if (!staticDir) {
    console.warn('[AlternativeStatic] AVISO: Não foi possível encontrar um diretório com index.html!');
    console.warn('[AlternativeStatic] A aplicação web não funcionará corretamente.');
    
    // Tentar usar o primeiro diretório que existe, mesmo sem index.html
    for (const dir of possibleStaticDirs) {
      if (fs.existsSync(dir)) {
        staticDir = dir;
        console.log(`[AlternativeStatic] Usando diretório alternativo: ${staticDir}`);
        break;
      }
    }
    
    if (!staticDir) {
      console.error('[AlternativeStatic] ERRO FATAL: Nenhum diretório estático encontrado!');
      throw new Error('Nenhum diretório de arquivos estáticos encontrado');
    }
  }
  
  // Configurar middleware para servir arquivos estáticos
  console.log(`[AlternativeStatic] Configurando Express para servir arquivos de: ${staticDir}`);
  app.use(express.static(staticDir));
  
  // Rota catch-all para SPA
  app.get('*', (req, res) => {
    // Evitar redirecionamento para arquivos da API
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.path
      });
    }
    
    // Servir index.html para todas as outras rotas
    const indexPath = path.join(staticDir, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('File not found. Application is not properly built.');
    }
  });
  
  return staticDir;
}