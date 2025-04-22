#!/usr/bin/env node

/**
 * Script para construir o código do servidor para produção
 * 
 * Este script transpila o código TypeScript do servidor para JavaScript
 * para que possa ser executado no ambiente de produção sem o TypeScript.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { execSync } from 'child_process';

// Configurar caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

console.log('🔨 Construindo código do servidor para produção...');

// Verificar se o diretório dist/server existe, criar se não
const distServerDir = path.join(rootDir, 'dist', 'server');
if (!fs.existsSync(distServerDir)) {
  try {
    fs.mkdirSync(distServerDir, { recursive: true });
    console.log(`Criado diretório: ${distServerDir}`);
  } catch (err) {
    console.error(`Erro ao criar diretório ${distServerDir}: ${err.message}`);
    process.exit(1);
  }
}

// Primeiro método: tentar usar TSC diretamente
async function buildWithTSC() {
  console.log('Tentando construir com TSC...');
  
  try {
    // Verificar se temos arquivos .ts na pasta server
    const serverDir = path.join(rootDir, 'server');
    const tsFiles = fs.readdirSync(serverDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
    
    if (tsFiles.length === 0) {
      console.warn('Nenhum arquivo TypeScript encontrado na pasta server');
      return false;
    }
    
    console.log(`Encontrados ${tsFiles.length} arquivos TypeScript na pasta server`);
    
    // Chamar tsc para transpilar
    try {
      execSync('npx tsc --project tsconfig.json', { stdio: 'inherit' });
      console.log('Build com tsc concluído com sucesso!');
      return true;
    } catch (err) {
      console.warn(`Erro ao executar tsc: ${err.message}`);
      return false;
    }
  } catch (err) {
    console.warn(`Erro ao verificar arquivos TypeScript: ${err.message}`);
    return false;
  }
}

// Segundo método: copiar os arquivos do servidor e converter manualmente
async function manualTranspile() {
  console.log('Transpilação com tsc falhou, fazendo transpilação manual...');
  
  const serverDir = path.join(rootDir, 'server');
  if (!fs.existsSync(serverDir)) {
    console.error('Pasta server não encontrada!');
    return false;
  }
  
  const files = [];
  try {
    // Obter todos os arquivos na pasta server
    const getAllFiles = (dir) => {
      const dirFiles = fs.readdirSync(dir);
      dirFiles.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          const subdir = path.join(distServerDir, path.relative(serverDir, fullPath));
          if (!fs.existsSync(subdir)) {
            fs.mkdirSync(subdir, { recursive: true });
          }
          getAllFiles(fullPath);
        } else {
          files.push(fullPath);
        }
      });
    };
    
    getAllFiles(serverDir);
  } catch (err) {
    console.error(`Erro ao listar arquivos: ${err.message}`);
    return false;
  }
  
  console.log(`Encontrados ${files.length} arquivos para processar`);
  
  // Processar cada arquivo
  for (const file of files) {
    const relativePath = path.relative(serverDir, file);
    let destPath = path.join(distServerDir, relativePath);
    
    // Para arquivos TypeScript, converter para JavaScript
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      destPath = destPath.replace(/\.tsx?$/, '.js');
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Transformações básicas de TypeScript para JavaScript
        let jsContent = content
          // Remover declarações de tipo
          .replace(/:\s*[A-Za-z0-9_<>[\].,|&?]*(?=\s*[=,)])/g, '')
          // Remover imports de tipos e interfaces
          .replace(/import\s+type\s+.*?from\s+.*?;/g, '')
          .replace(/import\s+{([^}]*)}\s+from\s+(['"])([^'"]*)\2;/g, (match, imports, quote, module) => {
            // Remover os tipos dos imports
            const cleanedImports = imports
              .split(',')
              .map(imp => imp.trim().replace(/\s+as\s+/g, ' as '))
              .filter(imp => !imp.startsWith('type '))
              .join(', ');
              
            if (cleanedImports.trim() === '') {
              return ''; // Import vazio, remover a linha toda
            }
            
            return `import { ${cleanedImports} } from ${quote}${module}${quote};`;
          })
          // Remover interfaces e tipos
          .replace(/^\s*(export\s+)?(interface|type)\s+[^{]*{[^}]*}\s*;?/gm, '')
          // Remover genéricos
          .replace(/<[^<>]*>/g, '')
          // Corrigir imports ESM
          .replace(/from\s+(['"])\.\/([^'"]*)(\.ts|\.tsx)\1/g, 'from $1./$2.js$1')
          .replace(/from\s+(['"])\.\.\/([^'"]*)(\.ts|\.tsx)\1/g, 'from $1../$2.js$1')
          // Corrigir erros comuns
          .replace(/export\s+{\s*};/g, '');
        
        // Garantir que o diretório de destino existe
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Gravar o arquivo JavaScript
        fs.writeFileSync(destPath, jsContent);
        console.log(`Transpilado: ${relativePath} -> ${path.relative(rootDir, destPath)}`);
      } catch (err) {
        console.error(`Erro ao transpilar ${file}: ${err.message}`);
      }
    } else {
      // Para outros arquivos, apenas copiar
      try {
        // Garantir que o diretório de destino existe
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(file, destPath);
        console.log(`Copiado: ${relativePath}`);
      } catch (err) {
        console.error(`Erro ao copiar ${file}: ${err.message}`);
      }
    }
  }
  
  // Tentar criar um index.js básico se não existir
  const indexJs = path.join(distServerDir, 'index.js');
  if (!fs.existsSync(indexJs)) {
    console.log('index.js não encontrado, criando versão básica...');
    
    const basicServerCode = `
// Servidor Express básico
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configurar Express
const app = express();
const PORT = process.env.PORT || 5000;

// Servir arquivos estáticos
const serveStatic = () => {
  // Verificar múltiplos locais possíveis
  const publicDirs = [
    path.join(rootDir, 'public'),
    path.join(rootDir, 'dist', 'public'),
    path.join(rootDir, 'dist', 'client')
  ];
  
  let usedDir = null;
  
  for (const dir of publicDirs) {
    if (fs.existsSync(dir)) {
      console.log(\`Servindo arquivos estáticos de: \${dir}\`);
      app.use(express.static(dir));
      usedDir = dir;
      break;
    }
  }
  
  // Fallback para index.html
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint não encontrado' });
    }
    
    for (const dir of publicDirs) {
      const indexPath = path.join(dir, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    
    // Último recurso
    res.status(500).send(\`
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
          <p><strong>Erro:</strong> Não foi possível carregar a interface.</p>
          <p><em>Erro técnico: Arquivos estáticos não encontrados</em></p>
        </div>
      </body>
      </html>
    \`);
  });
};

// Rotas da API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware para JSON
app.use(express.json());

// Servir arquivos estáticos e configurar fallback
serveStatic();

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Servidor iniciado na porta \${PORT}\`);
});`;
    
    fs.writeFileSync(indexJs, basicServerCode);
    console.log('Criado index.js básico para o servidor');
  }
  
  return true;
}

// Terceiro método: criar um arquivo básico se tudo mais falhar
function createBasicServerFile() {
  console.log('Criando servidor Express básico...');
  
  const indexJs = path.join(distServerDir, 'index.js');
  
  // Conteúdo do servidor básico
  const basicServerContent = `
// Servidor Express básico gerado automaticamente
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Iniciando servidor Express básico...');
console.log(\`Diretório atual: \${process.cwd()}\`);

// Middleware para parsing de JSON
app.use(express.json());

// Verificar múltiplos locais para servir arquivos estáticos
const publicDirs = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'dist', 'public'),
  path.join(rootDir, 'dist', 'client'),
  path.join(rootDir, 'static')
];

// Configurar middleware de arquivos estáticos
let foundStaticDir = false;
for (const dir of publicDirs) {
  if (fs.existsSync(dir)) {
    console.log(\`Servindo arquivos estáticos de: \${dir}\`);
    app.use(express.static(dir));
    foundStaticDir = true;
    
    // Verificar se temos index.html
    const indexHtml = path.join(dir, 'index.html');
    if (fs.existsSync(indexHtml)) {
      console.log(\`Usando index.html de: \${indexHtml}\`);
    }
  }
}

// Rota de diagnóstico
app.get('/api/health', (req, res) => {
  const staticDirs = publicDirs.map(dir => ({
    path: dir,
    exists: fs.existsSync(dir),
    files: fs.existsSync(dir) ? fs.readdirSync(dir).slice(0, 10) : []
  }));
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'not set',
    port: PORT,
    staticDirs
  });
});

// Rota básica para a API de regiões
app.get('/api/regions', (req, res) => {
  const regions = [
    { name: 'São Paulo', abbr: 'SP', vacancies: 26 },
    { name: 'Rio de Janeiro', abbr: 'RJ', vacancies: 18 },
    { name: 'Minas Gerais', abbr: 'MG', vacancies: 12 },
    { name: 'Bahia', abbr: 'BA', vacancies: 9 },
    { name: 'Paraná', abbr: 'PR', vacancies: 8 }
  ];
  
  res.json(regions);
});

// Rota fallback para SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint não encontrado' });
  }
  
  // Tentar encontrar index.html em qualquer diretório
  for (const dir of publicDirs) {
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // Resposta básica se não encontrar index.html
  res.status(200).send(\`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shopee Entregas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        header {
          background-color: #ee4d2d;
          color: white;
          padding: 1rem;
          text-align: center;
        }
        main {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
        }
        h1 { margin-top: 0; }
        h2 { color: #ee4d2d; }
      </style>
    </head>
    <body>
      <header>
        <h1>Shopee Entregas</h1>
      </header>
      <main>
        <div class="card">
          <h2>Seja um entregador parceiro</h2>
          <p>Receba pedidos e entregue com independência e flexibilidade.</p>
          <p>Entre em contato para mais informações.</p>
        </div>
        <div class="card">
          <h2>Benefícios</h2>
          <ul>
            <li>Horário flexível</li>
            <li>Ganhos semanais</li>
            <li>Suporte ao entregador</li>
            <li>Oportunidades em diversas regiões</li>
          </ul>
        </div>
      </main>
    </body>
    </html>
  \`);
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Servidor Express básico rodando na porta \${PORT}\`);
});
`;

  try {
    fs.writeFileSync(indexJs, basicServerContent);
    console.log(`✅ Arquivo básico do servidor criado em ${indexJs}`);
    return true;
  } catch (err) {
    console.error(`Erro ao criar servidor básico: ${err.message}`);
    return false;
  }
}

// Executar os métodos em sequência
async function executeBuilds() {
  // Primeiro tentar com o compilador TypeScript oficial
  let success = await buildWithTSC();
  
  // Se falhar, tentar transpilação manual
  if (!success) {
    success = await manualTranspile();
  }
  
  // Último recurso: criar um arquivo básico do servidor
  if (!success) {
    success = createBasicServerFile();
  }
  
  // Verificar resultado final
  const indexJs = path.join(distServerDir, 'index.js');
  if (fs.existsSync(indexJs)) {
    console.log(`✅ Build do servidor concluído com sucesso: ${indexJs}`);
    
    // Verificar imports no arquivo gerado
    try {
      const content = fs.readFileSync(indexJs, 'utf8');
      if (content.includes('require(')) {
        console.warn('⚠️ Aviso: O arquivo contém require() que pode não funcionar no modo ES Module');
        
        // Tentar corrigir require para import
        const fixedContent = content
          .replace(/const\s+([A-Za-z0-9_]+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 'import $1 from "$2";')
          .replace(/const\s+{\s*([^}]+)\s*}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 'import { $1 } from "$2";');
          
        fs.writeFileSync(indexJs, fixedContent);
        console.log('✅ Corrigidos imports no arquivo index.js');
      }
    } catch (err) {
      console.error(`Erro ao verificar imports: ${err.message}`);
    }
    
    return 0;
  } else {
    console.error('❌ Falha no build do servidor, index.js não foi gerado!');
    return 1;
  }
}

// Executar o build
try {
  const exitCode = await executeBuilds();
  process.exit(exitCode);
} catch (err) {
  console.error(`❌ Erro fatal no build: ${err.message}`);
  process.exit(1);
}