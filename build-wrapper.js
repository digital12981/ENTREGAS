/**
 * Build wrapper script for Heroku deployment
 * 
 * This script runs the build process and performs additional tasks
 * to ensure the application can start correctly on Heroku.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process for Heroku deployment...');

try {
  // Run the regular build process
  console.log('Running npm build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
  
  // Run the post-build steps
  console.log('Running post-build steps...');
  
  // Ensure the server directory exists in dist
  const serverDir = path.join(__dirname, 'dist', 'server');
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
    console.log('✅ Created server directory in dist folder');
  }
  
  // Check if the dist/index.js file exists
  const indexPath = path.join(__dirname, 'dist', 'index.js');
  if (fs.existsSync(indexPath)) {
    console.log('✅ Found index.js in dist folder');
  } else {
    throw new Error('index.js not found in dist folder. Build may have failed.');
  }
  
  console.log('✅ All build steps completed successfully');
} catch (error) {
  console.error('❌ Error during build process:', error.message);
  process.exit(1);
}