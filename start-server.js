/**
 * Script para iniciar o servidor
 * 
 * Este script tenta iniciar o servidor usando diferentes abordagens
 * dependendo do ambiente e configuração disponível.
 */

const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Inicializando servidor...');

// Verificar ambiente
const isProduction = process.env.NODE_ENV === 'production';
console.log(`📌 Ambiente: ${isProduction ? 'produção' : 'desenvolvimento'}`);
console.log(`📌 Diretório atual: ${process.cwd()}`);

// Tentar diferentes caminhos
const tryServerStartup = () => {
  try {
    // Primeira tentativa: Verificar se dist/server/index.js existe e tentar executá-lo
    const esmServerPath = path.join(process.cwd(), 'dist', 'server', 'index.js');
    if (fs.existsSync(esmServerPath)) {
      console.log('Tentando executar servidor ES modules...');
      try {
        execSync('node dist/server/index.js', { stdio: 'inherit' });
        return true;
      } catch (error) {
        console.log(`❌ Falha ao executar servidor ES modules: ${error.message}`);
      }
    } else {
      console.log('❌ Arquivo dist/server/index.js não encontrado.');
    }

    // Segunda tentativa: Verificar heroku-start.mjs
    const herokuStartPath = path.join(process.cwd(), 'heroku-start.mjs');
    if (fs.existsSync(herokuStartPath)) {
      console.log('Tentando executar heroku-start.mjs...');
      try {
        execSync('node heroku-start.mjs', { stdio: 'inherit' });
        return true;
      } catch (error) {
        console.log(`❌ Falha ao executar heroku-start.mjs: ${error.message}`);
      }
    }

    // Terceira tentativa: Usar server-fallback.js
    const fallbackPath = path.join(process.cwd(), 'server-fallback.js');
    if (fs.existsSync(fallbackPath)) {
      console.log('Usando servidor de fallback...');
      execSync('node server-fallback.js', { stdio: 'inherit' });
      return true;
    }

    // Quarta tentativa: Tentar iniciar diretamente o server/index.ts com tsx
    const tsServerPath = path.join(process.cwd(), 'server', 'index.ts');
    if (fs.existsSync(tsServerPath)) {
      try {
        console.log('Tentando executar servidor TypeScript diretamente com tsx...');
        execSync('npx tsx server/index.ts', { stdio: 'inherit' });
        return true;
      } catch (error) {
        console.log(`❌ Falha ao executar servidor TypeScript: ${error.message}`);
      }
    }

    // Quinta tentativa: Criar um servidor básico na hora
    console.log('Criando servidor Express básico de emergência...');
    
    // Escrever servidor básico
    const basicServerContent = `
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚨 Servidor de emergência iniciado');

// Procurar por arquivos estáticos
const publicDirs = [
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'dist/public'),
  path.join(process.cwd(), 'dist/client')
];

for (const dir of publicDirs) {
  if (fs.existsSync(dir)) {
    console.log(\`Servindo arquivos estáticos de: \${dir}\`);
    app.use(express.static(dir));
  }
}

// Rota para API de saúde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'emergency',
    environment: process.env.NODE_ENV
  });
});

// Rota para API de regiões (simulada)
app.get('/api/regions', (req, res) => {
  res.json([
    { name: 'São Paulo', abbr: 'SP', vacancies: 26 },
    { name: 'Rio de Janeiro', abbr: 'RJ', vacancies: 18 },
    { name: 'Minas Gerais', abbr: 'MG', vacancies: 12 }
  ]);
});

// Rota de fallback para SPA
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
  res.send(\`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shopee Entregas</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; }
          h1 { color: #ee4d2d; }
        </style>
      </head>
      <body>
        <h1>Shopee Entregas</h1>
        <p>Seja um entregador parceiro da Shopee.</p>
      </body>
    </html>
  \`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Servidor rodando na porta \${PORT}\`);
});
`;

    const emergencyServerPath = path.join(process.cwd(), 'emergency-server.js');
    fs.writeFileSync(emergencyServerPath, basicServerContent);
    console.log('Servidor de emergência criado.');
    
    // Executar o servidor de emergência
    execSync('node emergency-server.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Falha fatal ao iniciar servidor: ${error.message}`);
    return false;
  }
};

// Tentar iniciar o servidor
const result = tryServerStartup();

// Retornar código de saída apropriado
process.exit(result ? 0 : 1);