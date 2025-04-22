/**
 * Custom build script for Heroku deployment
 * This script builds the app and ensures the files are in the expected locations
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running custom Heroku build script...');

// Function to execute a command and display the log
function execCommand(command) {
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Build the app using the normal build script
console.log('Building the application...');
execCommand('npm run build');

// Create the public directory if it doesn't exist
const publicDir = path.resolve(process.cwd(), 'public');
const distDir = path.resolve(process.cwd(), 'dist');
const distClientDir = path.resolve(distDir, 'client');

if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// If the dist/client directory exists, copy its contents to public
if (fs.existsSync(distClientDir)) {
  console.log('Copying dist/client files to public directory...');
  execCommand('cp -r dist/client/* public/');
} else if (fs.existsSync(distDir)) {
  // Check if dist has client files (like index.html)
  if (fs.existsSync(path.join(distDir, 'index.html'))) {
    console.log('Copying dist files to public directory...');
    execCommand('cp -r dist/* public/');
  }
}

console.log('Build completed successfully!');