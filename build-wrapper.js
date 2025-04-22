import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('🏗️ Iniciando build...');
  
  // Execute o build
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Build do frontend concluído');
  
  // Compilar o servidor diretamente para dist/server
  console.log('Compilando arquivos do servidor...');
  
  // Criar diretório dist/server
  const serverDir = join(__dirname, 'dist', 'server');
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
    console.log('✅ Criado diretório server em dist');
  }
  
  // Compilar os arquivos TypeScript do servidor diretamente para dist/server
  execSync('esbuild server/**/*.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server', 
    { stdio: 'inherit' });
  console.log('✅ Arquivos do servidor compilados');
  
  // Verificar se os arquivos foram criados corretamente
  const routesPath = join(__dirname, 'dist', 'server', 'routes.js');
  if (fs.existsSync(routesPath)) {
    console.log('✅ Arquivo routes.js encontrado');
  } else {
    throw new Error('routes.js não foi encontrado em dist/server. Build falhou.');
  }
  
  const vitePath = join(__dirname, 'dist', 'server', 'vite.js');
  if (fs.existsSync(vitePath)) {
    console.log('✅ Arquivo vite.js encontrado');
  } else {
    throw new Error('vite.js não foi encontrado em dist/server. Build falhou.');
  }
  
  console.log('✅ Build concluído com sucesso');
} catch (error) {
  console.error('❌ Erro durante o build:', error);
  process.exit(1);
}