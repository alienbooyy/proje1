#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

console.log('🔍 Verifying distribution package...\n');

const requiredFiles = [
  'pos-system.exe',
  'config.json',
  'README.txt',
  'public/index.html',
  'public/css/style.css',
  'public/js/app.js'
];

let allValid = true;

console.log('Checking required files:');
requiredFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (!exists) allValid = false;
});

console.log('\nChecking file sizes:');
const exePath = path.join(distDir, 'pos-system.exe');
if (fs.existsSync(exePath)) {
  const stats = fs.statSync(exePath);
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`  📦 pos-system.exe: ${sizeInMB} MB`);
  
  if (stats.size < 30 * 1024 * 1024) {
    console.log('  ⚠️  Warning: Executable seems too small (< 30MB)');
    allValid = false;
  }
}

console.log('\nChecking directory structure:');
const distContents = fs.readdirSync(distDir);
console.log('  Contents:', distContents.join(', '));

if (allValid) {
  console.log('\n✅ Distribution package is valid and ready!');
  console.log('\nTo create a zip file for distribution:');
  console.log('  cd dist && zip -r ../pos-system-dist.zip *');
  console.log('\nOr use 7-Zip on Windows:');
  console.log('  7z a pos-system-dist.zip ./dist/*');
  process.exit(0);
} else {
  console.log('\n❌ Distribution package is incomplete!');
  console.log('Run: npm run package');
  process.exit(1);
}
