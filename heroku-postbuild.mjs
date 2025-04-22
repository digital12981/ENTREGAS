/**
 * Custom post-build script for Heroku deployment
 * 
 * This script runs after the build process to ensure the correct directory structure
 * for the server files in the dist folder.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('Running post-build script for Heroku deployment...');
    
    // Create server directory in dist if it doesn't exist
    const serverDir = path.join(__dirname, 'dist', 'server');
    try {
      await fs.mkdir(serverDir, { recursive: true });
      console.log('✅ Created server directory in dist folder');
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
    
    // Check if index.js exists in dist
    const indexPath = path.join(__dirname, 'dist', 'index.js');
    
    try {
      await fs.access(indexPath);
      console.log('✅ Found index.js in dist folder');
    } catch (err) {
      console.error('❌ index.js not found in dist folder. Build may have failed.');
      process.exit(1);
    }
    
    console.log('✅ Post-build steps completed successfully.');
  } catch (error) {
    console.error('❌ Error in post-build script:', error);
    process.exit(1);
  }
}

main();