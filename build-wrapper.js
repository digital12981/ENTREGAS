import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('🏗️ Iniciando build...');
  
  // Execute o build com configuração para garantir que os assets sejam gerados corretamente
  process.env.VITE_BASE_PATH = '/';
  process.env.VITE_ASSETS_DIR = 'assets';
  execSync('vite build --base=/ --assetsDir=assets --emptyOutDir --outDir=dist', { stdio: 'inherit' });
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
  
  // Verificar e garantir que os assets estáticos estejam no lugar certo
  console.log('Verificando arquivos estáticos...');
  
  const publicPath = join(__dirname, 'dist', 'public');
  if (!fs.existsSync(publicPath)) {
    console.log('Criando diretório para arquivos públicos...');
    fs.mkdirSync(publicPath, { recursive: true });
  }
  
  // Verificar se o index.html existe e está na pasta correta
  const indexHtmlPath = join(publicPath, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.log('Copiando index.html para a pasta public...');
    
    // Tentar encontrar o index.html
    let sourceIndexPath = join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(sourceIndexPath)) {
      // Copiar para a pasta public
      fs.copyFileSync(sourceIndexPath, indexHtmlPath);
      console.log('✅ index.html copiado com sucesso');
    } else {
      console.warn('⚠️ index.html não encontrado para copiar');
    }
  }
  
  // Verificar pasta de assets
  const assetsPath = join(publicPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    console.log('Criando diretório de assets...');
    fs.mkdirSync(assetsPath, { recursive: true });
    
    // Tentar encontrar a pasta de assets original
    const sourceAssetsPath = join(__dirname, 'dist', 'assets');
    if (fs.existsSync(sourceAssetsPath)) {
      console.log('Copiando assets para a pasta public/assets...');
      // Listar todos os arquivos na pasta de assets
      const assetFiles = fs.readdirSync(sourceAssetsPath);
      
      // Copiar cada arquivo
      assetFiles.forEach(file => {
        const sourcePath = join(sourceAssetsPath, file);
        const destPath = join(assetsPath, file);
        
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`  ✓ Copiado: ${file}`);
        }
      });
      
      console.log('✅ Assets copiados com sucesso');
    } else {
      console.warn('⚠️ Pasta de assets não encontrada para copiar');
    }
  }
  
  // Verificação e otimização da estrutura final
  console.log('Verificando estrutura final dos arquivos na pasta dist...');
  try {
    const distDir = join(__dirname, 'dist');
    const filesInDist = fs.readdirSync(distDir);
    console.log('Arquivos em dist:', filesInDist);
    
    // Verificar assets
    if (filesInDist.includes('assets')) {
      const assetsFiles = fs.readdirSync(join(distDir, 'assets'));
      console.log('Arquivos em dist/assets:', assetsFiles.length > 10 
        ? `${assetsFiles.slice(0, 10).join(', ')} e mais ${assetsFiles.length - 10} arquivo(s)`
        : assetsFiles.join(', '));
    }
    
    // Verificar public e index.html
    if (filesInDist.includes('public')) {
      const publicFiles = fs.readdirSync(join(distDir, 'public'));
      console.log('Arquivos em dist/public:', publicFiles);
      
      // Verificar o index.html na pasta public
      const publicIndexPath = join(distDir, 'public', 'index.html');
      const distIndexPath = join(distDir, 'index.html');
      
      if (fs.existsSync(publicIndexPath)) {
        // Certificar que o index.html também existe na raiz de dist
        if (!fs.existsSync(distIndexPath)) {
          console.log('Copiando index.html de dist/public para dist/...');
          fs.copyFileSync(publicIndexPath, distIndexPath);
          console.log('✅ index.html copiado para a raiz de dist');
        }
        
        // Verificar o tamanho do index.html
        const indexSize = fs.statSync(publicIndexPath).size;
        console.log(`Tamanho do index.html: ${indexSize} bytes`);
      }
    }
    
    // Verificar index.html
    if (filesInDist.includes('index.html')) {
      const indexSize = fs.statSync(join(distDir, 'index.html')).size;
      console.log(`Tamanho do index.html na raiz: ${indexSize} bytes`);
    } else {
      console.warn('⚠️ index.html não encontrado na raiz de dist');
    }
  } catch (e) {
    console.warn('Erro ao listar arquivos finais:', e);
  }
  
  console.log('✅ Build concluído com sucesso');
} catch (error) {
  console.error('❌ Erro durante o build:', error);
  process.exit(1);
}