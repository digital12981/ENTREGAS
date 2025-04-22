/**
 * Script to verify environment configuration for Heroku
 */
console.log('Verifying environment configuration...');
console.log('Current timestamp:', new Date().toISOString());
console.log('Node version:', process.version);
console.log('Node environment:', process.env.NODE_ENV);
console.log('Current directory:', process.cwd());

// Check for required environment variables
const requiredVars = ['DATABASE_URL', 'FOR4PAYMENTS_SECRET_KEY'];
const missingVars = [];
const configuredVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    configuredVars.push(varName);
  }
});

console.log('Configured environment variables:', configuredVars.join(', '));
console.log('Missing environment variables:', missingVars.length > 0 ? missingVars.join(', ') : 'None');

// Check directories
const fs = require('fs');
const path = require('path');

const dirsToCheck = [
  'dist',
  'dist/client',
  'public'
];

dirsToCheck.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  const exists = fs.existsSync(fullPath);
  console.log(`Directory ${dir} exists: ${exists}`);
  
  if (exists) {
    try {
      const files = fs.readdirSync(fullPath);
      console.log(`Files in ${dir}: ${files.length}`);
      
      // Check for index.html specifically
      const hasIndexHtml = files.includes('index.html');
      console.log(`${dir} contains index.html: ${hasIndexHtml}`);
    } catch (err) {
      console.error(`Error reading directory ${dir}:`, err.message);
    }
  }
});

console.log('Environment verification complete.');