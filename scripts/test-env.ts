#!/usr/bin/env tsx
/**
 * Test script to validate environment configuration
 */

import { config } from 'dotenv';
import { validateEnv, getEnv } from '../lib/env';

config();

console.log('🔍 Testing Environment Configuration\n');

try {
  validateEnv();
  const env = getEnv();

  console.log('\n📋 Configuration Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Environment:     ${env.NODE_ENV}`);
  console.log(`API Port:        ${env.PORT}`);
  console.log(`Database:        ${env.DATABASE_URL.split('@')[1] || 'configured'}`);
  console.log(`Encryption Key:  ${env.PROOF_ENCRYPTION_KEY.substring(0, 8)}... (${env.PROOF_ENCRYPTION_KEY.length} chars)`);
  console.log(`Session Secret:  ${env.SESSION_SECRET.substring(0, 8)}... (${env.SESSION_SECRET.length} chars)`);
  console.log(`JWT Secret:      ${env.JWT_SECRET.substring(0, 8)}... (${env.JWT_SECRET.length} chars)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🔌 Optional Integrations:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`zkPass:          ${env.ZKPASS_APP_ID && !env.ZKPASS_APP_ID.startsWith('your-') ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Redis:           ${env.REDIS_URL && env.REDIS_URL !== '' ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Greenhouse:      ${env.GREENHOUSE_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Lever:           ${env.LEVER_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`SMTP:            ${env.SMTP_HOST ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Sentry:          ${env.SENTRY_DSN && env.SENTRY_DSN !== '' ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Blockchain:      ${env.BLOCKCHAIN_ENABLED ? '✅ Enabled' : '❌ Disabled'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n✅ Environment configuration is valid!\n');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Environment configuration test failed\n');
  process.exit(1);
}
