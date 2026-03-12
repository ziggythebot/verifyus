/**
 * zkPass Integration Test
 *
 * Simple test to verify zkPass SDK is properly installed and configured
 */

import TransgateConnect from '@zkpass/transgate-js-sdk';
import { getZkPassConfig, createZkPassClient } from '../lib/zkpass';

console.log('🧪 Testing zkPass Integration\n');

// Test 1: Check if SDK is importable
console.log('✓ zkPass TransGate SDK imported successfully');
console.log(`  - TransgateConnect class: ${typeof TransgateConnect}`);

// Test 2: Check environment configuration
console.log('\n📋 Checking environment configuration...');
try {
  const config = getZkPassConfig();
  console.log('✓ zkPass configuration found:');
  console.log(`  - App ID: ${config.appId.substring(0, 10)}...`);
  console.log(`  - Schema ID: ${config.schemaId.substring(0, 10)}...`);
} catch (error) {
  console.log('⚠ zkPass configuration not set (expected in development)');
  console.log(`  ${error instanceof Error ? error.message : 'Unknown error'}`);
  console.log('  → Set ZKPASS_APP_ID and ZKPASS_SCHEMA_ID in .env to enable');
}

// Test 3: Check client creation
console.log('\n🔧 Testing client creation...');
try {
  const testAppId = process.env.ZKPASS_APP_ID || 'test-app-id';
  const client = createZkPassClient(testAppId);
  console.log('✓ zkPass client created successfully');
  console.log(`  - Base server: ${client.baseServer}`);
  console.log(`  - App ID: ${client.appid}`);
} catch (error) {
  console.log('✗ Failed to create zkPass client');
  console.log(`  ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exit(1);
}

// Test 4: Check API routes exist
console.log('\n📁 Checking file structure...');
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'lib/zkpass.ts',
  'lib/hooks/useZkPass.ts',
  'lib/types/zkpass.ts',
  'api/routes/zkpass.ts',
  'app/components/ZkPassVerification.tsx',
  'docs/zkpass-integration.md',
];

let allFilesExist = true;
for (const file of filesToCheck) {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allFilesExist = false;
}

if (allFilesExist) {
  console.log('\n✅ All zkPass integration files present');
} else {
  console.log('\n⚠ Some files are missing');
  process.exit(1);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('zkPass Integration Test Summary');
console.log('='.repeat(50));
console.log('✓ SDK installed and importable');
console.log('✓ Integration files created');
console.log('✓ Client can be initialized');
console.log('\nNext steps:');
console.log('1. Set ZKPASS_APP_ID in .env (get from zkPass DevHub)');
console.log('2. Set ZKPASS_SCHEMA_ID in .env (create schema in DevHub)');
console.log('3. Start API server: npm run api:dev');
console.log('4. Test health endpoint: curl http://localhost:3001/api/v1/zkpass/health');
console.log('\n✅ zkPass integration test complete!\n');
