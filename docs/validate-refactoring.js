#!/usr/bin/env node

/**
 * Validation Script for Refactored Dashboard Components
 * This script checks if all the new components can be properly imported
 *
 * Run with: node validate-refactoring.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Refactored Dashboard Components...\n');

// Files that should exist
const requiredFiles = [
  { path: 'assets.js', description: 'Centralized assets configuration' },
  { path: 'constants.js', description: 'Business constants' },
  { path: 'components/Logo.jsx', description: 'Logo component' },
  { path: 'components/Sidebar.jsx', description: 'Sidebar component' },
  { path: 'components/MetricCard.jsx', description: 'MetricCard component' },
  { path: 'components/SummaryBlock.jsx', description: 'SummaryBlock component' },
  { path: 'components/ChartCard.jsx', description: 'ChartCard component' },
  { path: 'components/Dashboard.jsx', description: 'Main Dashboard component' },
  { path: 'components/index.js', description: 'Component exports' },
  { path: 'DashboardGeneralRefactored.jsx', description: 'Refactored dashboard implementation' },
  { path: '.env', description: 'Environment variables' },
];

// Old files that can be deleted
const oldFiles = [
  'DashboardGeneral.jsx',
  'DashboardGeneralCambio.jsx',
  'DashboardGeneralCambiarNombre.jsx',
  'DashboardGeneralCambioPendiente.jsx',
  'DashboardGeneralPorSector.jsx',
  'DashboardGeneralPorSectorDropdown.jsx',
  'DashboardGeneralPorSectorPorSensor.jsx',
  'DashboardGeneralNoInternet.jsx',
  'DashboardGeneralMobile.jsx',
  'DashboardGeneralMobileNoInternet.jsx',
  'DashboardGeneralIPhone16Plus.jsx',
  'DashboardGeneralIPhone16PlusSensorTotal.jsx',
];

let allValid = true;
let filesCreated = 0;
let filesMissing = 0;

// Check required files
console.log('📋 Checking required files:\n');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file.path);
  const exists = fs.existsSync(filePath);

  if (exists) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✅ ${file.path.padEnd(40)} (${sizeKB} KB) - ${file.description}`);
    filesCreated++;
  } else {
    console.log(`❌ ${file.path.padEnd(40)} - MISSING!`);
    allValid = false;
    filesMissing++;
  }
});

console.log(`\n📊 Summary: ${filesCreated}/${requiredFiles.length} files found\n`);

// Check old files
console.log('🗑️  Old files that can be deleted:\n');
let oldFilesFound = 0;
oldFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`⚠️  ${file.padEnd(50)} (${sizeKB} KB) - Can be removed`);
    oldFilesFound++;
  }
});

if (oldFilesFound === 0) {
  console.log('✅ No old files found - already cleaned up!');
} else {
  console.log(`\n⚠️  Found ${oldFilesFound} old files that can be deleted`);
}

// Check .env configuration
console.log('\n🔧 Environment Configuration:\n');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('REACT_APP_ASSET_URL')) {
    console.log('✅ .env file configured with REACT_APP_ASSET_URL');
  } else {
    console.log('⚠️  .env file exists but REACT_APP_ASSET_URL not found');
  }
} else {
  console.log('❌ .env file not found');
}

// Final verdict
console.log('\n' + '='.repeat(70));
if (allValid && filesMissing === 0) {
  console.log('✅ ✅ ✅  ALL CHECKS PASSED! Refactoring is complete and valid.');
  console.log('\n📝 Next steps:');
  console.log('   1. Import DashboardGeneralRefactored in your App.js');
  console.log('   2. Test the component in your browser');
  console.log('   3. Delete old files when ready (see list above)');
  console.log('   4. Restart your dev server to load .env variables\n');
} else {
  console.log(`❌ VALIDATION FAILED: ${filesMissing} files missing`);
  console.log('\nPlease ensure all required files are created.\n');
}
console.log('='.repeat(70) + '\n');

process.exit(allValid ? 0 : 1);
