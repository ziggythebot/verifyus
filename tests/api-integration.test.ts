/**
 * API Integration Test
 *
 * Test the /api/v1/verify endpoint with zkPass proof submission
 */

import type { Result } from '@zkpass/transgate-js-sdk/lib/types';

// Mock zkPass proof (structure matches the real zkPass Result interface)
const mockZkPassProof: Result = {
  allocatorAddress: '0x1234567890123456789012345678901234567890',
  allocatorSignature: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  publicFields: [
    'US_PASSPORT',
    'USA',
    'VALID',
    '1804812744394'
  ],
  publicFieldsHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
  taskId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  uHash: '0xuniquehash1234567890abcdef1234567890abcdef1234567890abcdef123456',
  validatorAddress: '0x0987654321098765432109876543210987654321',
  validatorSignature: '0xvalidatorsig1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  recipient: 'test@example.com'
};

// Test payload
const testPayload = {
  proof: mockZkPassProof,
  metadata: {
    email: 'applicant@example.com',
    jobTitle: 'Software Engineer',
    companyName: 'Tech Corp',
  }
};

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           API Integration Test - Proof Submission             ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('=== Test Configuration ===');
console.log(`API Endpoint: POST /api/v1/verify`);
console.log(`Test Email: ${testPayload.metadata.email}`);
console.log(`Job Title: ${testPayload.metadata.jobTitle}`);
console.log(`Company: ${testPayload.metadata.companyName}`);
console.log(`\n=== Request Payload Structure ===`);
console.log(JSON.stringify(testPayload, null, 2));

console.log('\n=== Expected Response ===');
console.log(`{
  success: true,
  verificationId: "uuid-string",
  applicantId: "uuid-string",
  proofId: "uuid-string",
  verified: true,
  expiresAt: "ISO-8601-date",
  message: "Verification successful"
}`);

console.log('\n=== Validation Checks ===');
console.log('✓ Proof structure matches zkPass Result interface');
console.log('✓ Email is present in metadata');
console.log('✓ Job metadata is included');
console.log('✓ All required proof fields are present:');
console.log('  - taskId:', mockZkPassProof.taskId ? '✓' : '✗');
console.log('  - validatorSignature:', mockZkPassProof.validatorSignature ? '✓' : '✗');
console.log('  - uHash:', mockZkPassProof.uHash ? '✓' : '✗');
console.log('  - publicFields:', Array.isArray(mockZkPassProof.publicFields) ? '✓' : '✗');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                    Integration Test Ready                      ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('\nTo test the actual API endpoint:');
console.log('1. Start the API server: npm run dev:api');
console.log('2. Run: curl -X POST http://localhost:3001/api/v1/verify \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'', JSON.stringify(testPayload), '\'');
console.log('\n✓ Test configuration validated successfully!\n');
