#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');
const configFile = path.join(__dirname, '..', 'config.json');
const usageReadme = path.join(__dirname, '..', 'USAGE_README.txt');
const startBat = path.join(__dirname, '..', 'start.bat');

console.log('📦 Packaging POS System for distribution...');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Check if exe exists
const exePath = path.join(distDir, 'pos-system.exe');
if (!fs.existsSync(exePath)) {
  console.error('❌ Error: pos-system.exe not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('✓ Found executable:', exePath);

// Copy public directory
const distPublicDir = path.join(distDir, 'public');
console.log('📁 Copying public directory...');
copyDirectoryRecursive(publicDir, distPublicDir);
console.log('✓ Public directory copied');

// Copy config.json
console.log('📄 Copying config.json...');
fs.copyFileSync(configFile, path.join(distDir, 'config.json'));
console.log('✓ config.json copied');

// Copy usage README
console.log('📄 Copying README...');
fs.copyFileSync(usageReadme, path.join(distDir, 'README.txt'));
console.log('✓ README.txt copied');

// Copy start.bat
console.log('📄 Copying start.bat...');
fs.copyFileSync(startBat, path.join(distDir, 'start.bat'));
console.log('✓ start.bat copied');

console.log('\n✅ Packaging complete!');
console.log('\nDistribution package ready in: dist/');
console.log('\nContents:');
console.log('  - pos-system.exe (main executable)');
console.log('  - start.bat (quick start launcher)');
console.log('  - config.json (configuration)');
console.log('  - public/ (web interface)');
console.log('  - README.txt (user guide)');
console.log('\nYou can now zip the dist/ folder for distribution.');

// Helper function to copy directory recursively
function copyDirectoryRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}
