/**
 * Script to verify environment configuration for Heroku
 */

// Force use of CommonJS to avoid import issues
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===== HEROKU ENVIRONMENT VERIFICATION =====');
console.log('Date/Time:', new Date().toISOString());
console.log('Node version:', process.version);

// Log environment variables
console.log('\n===== ENVIRONMENT VARIABLES =====');
const requiredVars = ['NODE_ENV', 'DATABASE_URL', 'FOR4PAYMENTS_SECRET_KEY'];
const optionalVars = ['PORT', 'FOR4PAYMENTS_API_URL', 'HOST'];

let missingVars = 0;
requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✓ ${varName}: configured`);
  } else {
    console.log(`✗ ${varName}: NOT configured (required)`);
    missingVars++;
  }
});

optionalVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✓ ${varName}: configured (${process.env[varName]})`);
  } else {
    console.log(`- ${varName}: not configured (optional)`);
  }
});

if (missingVars > 0) {
  console.error(`\n⚠ There are ${missingVars} missing required environment variables.`);
}

// Check if in production
console.log('\n===== ENVIRONMENT TYPE =====');
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);

// Check directories
console.log('\n===== DIRECTORIES =====');
const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

console.log(`Root directory: ${rootDir}`);
console.log(`dist exists: ${fs.existsSync(distDir) ? 'Yes' : 'No'}`);
console.log(`public exists: ${fs.existsSync(publicDir) ? 'Yes' : 'No'}`);

// Check files
console.log('\n===== CRITICAL FILES =====');
const criticalFiles = [
  { path: path.join(distDir, 'index.js'), desc: 'Server entry point' },
  { path: path.join(publicDir, 'index.html'), desc: 'Frontend entry point' },
  { path: path.join(publicDir, 'favicon.ico'), desc: 'Favicon' },
  { path: 'heroku-start.mjs', desc: 'Heroku startup script' },
  { path: 'Procfile', desc: 'Heroku process file' }
];

criticalFiles.forEach(({ path: filePath, desc }) => {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✓' : '✗'} ${desc} (${filePath}): ${exists ? 'found' : 'NOT FOUND'}`);
});

// Check Procfile content
console.log('\n===== PROCFILE CONFIGURATION =====');
if (fs.existsSync('Procfile')) {
  const procfileContent = fs.readFileSync('Procfile', 'utf8');
  console.log(procfileContent);
}

// List public directory content
if (fs.existsSync(publicDir)) {
  console.log('\n===== PUBLIC DIRECTORY CONTENT =====');
  const publicFiles = fs.readdirSync(publicDir);
  console.log(`Found ${publicFiles.length} files in public/:`);
  console.log(publicFiles.join(', '));
}

// Check server can start
console.log('\n===== SERVER START CHECK =====');
try {
  if (fs.existsSync(path.join(distDir, 'index.js'))) {
    console.log('Server index.js exists, ready to start.');
  } else {
    console.error('Server index.js does not exist!');
  }
} catch (err) {
  console.error('Error checking server:', err.message);
}

console.log('\n===== VERIFICATION COMPLETE =====');