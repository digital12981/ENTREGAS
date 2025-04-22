import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('🏗️ Iniciando build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completado com sucesso');
  
  // Run the post-build steps
  console.log('Running post-build steps...');
  
  // Ensure the server directory exists in dist
  const serverDir = join(__dirname, 'dist', 'server');
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
    console.log('✅ Created server directory in dist folder');
  }
  
  // Check if the dist/index.js file exists
  const indexPath = join(__dirname, 'dist', 'index.js');
  if (fs.existsSync(indexPath)) {
    console.log('✅ Found index.js in dist folder');
  } else {
    throw new Error('index.js not found in dist folder. Build may have failed.');
  }
  
  console.log('✅ All build steps completed successfully');
} catch (error) {
  console.error('❌ Erro durante o build:', error);
  process.exit(1);
}