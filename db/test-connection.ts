#!/usr/bin/env tsx
/**
 * Test database connection and basic operations
 * Run with: npx tsx db/test-connection.ts
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env') });

import db from '../lib/db';

async function testConnection() {
  console.log('Testing database connection...\n');

  try {
    // 1. Health check
    console.log('1. Health check...');
    const isHealthy = await db.healthCheck();
    console.log(`   ✓ Database connection: ${isHealthy ? 'OK' : 'FAILED'}\n`);

    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    // 2. Create test applicant
    console.log('2. Creating test applicant...');
    const applicant = await db.createApplicant({
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
    });
    console.log(`   ✓ Created applicant: ${applicant.email} (ID: ${applicant.id})\n`);

    // 3. Create test proof
    console.log('3. Creating test proof...');
    const testProofData = JSON.stringify({
      type: 'us_passport',
      issuer: 'US_STATE_DEPT',
      verified: true,
      timestamp: Date.now(),
    });

    const proof = await db.createProof({
      applicantId: applicant.id,
      proofData: testProofData,
      proofType: 'us_passport',
      dataSource: 'zkpass',
      confidenceScore: 0.95,
      deviceFingerprint: 'test-device-123',
      ipAddress: '127.0.0.1',
      userAgent: 'Test/1.0',
      metadata: { test: true },
    });
    console.log(`   ✓ Created proof: ${proof.id}`);
    console.log(`   ✓ Proof hash: ${proof.proof_hash.substring(0, 16)}...`);
    console.log(`   ✓ Expires at: ${proof.expires_at}\n`);

    // 4. Test encryption/decryption
    console.log('4. Testing encryption...');
    const decrypted = db.decryptProof(proof.proof_data);
    const isMatch = decrypted === testProofData;
    console.log(`   ✓ Decryption: ${isMatch ? 'OK' : 'FAILED'}\n`);

    // 5. Test duplicate detection
    console.log('5. Testing duplicate detection...');
    const isDuplicate = await db.isDuplicateProof(proof.proof_hash);
    console.log(`   ✓ Duplicate check: ${isDuplicate ? 'FOUND' : 'NOT FOUND'}\n`);

    // 6. Get active proof
    console.log('6. Getting active proof...');
    const activeProof = await db.getActiveProof(applicant.id);
    console.log(`   ✓ Active proof found: ${activeProof ? 'YES' : 'NO'}`);
    if (activeProof) {
      console.log(`   ✓ Proof ID: ${activeProof.id}\n`);
    }

    // 7. Find applicant by email
    console.log('7. Finding applicant by email...');
    const foundApplicant = await db.findApplicantByEmail(applicant.email);
    console.log(`   ✓ Found applicant: ${foundApplicant ? 'YES' : 'NO'}`);
    if (foundApplicant) {
      console.log(`   ✓ Verification count: ${foundApplicant.verification_count}\n`);
    }

    // 8. Create verification record
    console.log('8. Creating verification record...');

    // First, get a test employer (from seed data)
    const employerResult = await db.query(
      "SELECT id FROM employers WHERE email = 'admin@test-agency.com' LIMIT 1"
    );

    if (employerResult.rows.length === 0) {
      console.log('   ⚠ No test employer found (run schema.sql to create seed data)\n');
    } else {
      const verification = await db.createVerification({
        applicantId: applicant.id,
        employerId: employerResult.rows[0].id,
        proofId: proof.id,
        jobId: 'job-123',
        jobTitle: 'Software Engineer',
        verified: true,
        verificationMethod: 'api',
        ipAddress: '127.0.0.1',
      });
      console.log(`   ✓ Created verification: ${verification.id}\n`);

      // Check if applicant stats were updated
      const updatedApplicant = await db.findApplicantByEmail(applicant.email);
      console.log('   ✓ Applicant stats updated:');
      console.log(`     - Verification count: ${updatedApplicant.verification_count}`);
      console.log(`     - Last verified: ${updatedApplicant.last_verified_at}\n`);
    }

    // 9. Create fraud alert
    console.log('9. Creating fraud alert...');
    const fraudAlert = await db.createFraudAlert({
      applicantId: applicant.id,
      proofId: proof.id,
      alertType: 'test_alert',
      severity: 'low',
      description: 'This is a test fraud alert',
      metadata: { test: true },
    });
    console.log(`   ✓ Created fraud alert: ${fraudAlert.id}\n`);

    // 10. Create audit log
    console.log('10. Creating audit log...');
    const auditLog = await db.createAuditLog({
      userId: applicant.id,
      userType: 'applicant',
      action: 'test_action',
      resourceType: 'proof',
      resourceId: proof.id,
      ipAddress: '127.0.0.1',
      status: 'success',
      metadata: { test: true },
    });
    console.log(`   ✓ Created audit log: ${auditLog.id}\n`);

    // 11. Test views
    console.log('11. Testing views...');
    const activeProofsResult = await db.query('SELECT COUNT(*) FROM active_proofs');
    console.log(`   ✓ Active proofs view: ${activeProofsResult.rows[0].count} proofs\n`);

    console.log('═══════════════════════════════════════');
    console.log('✓ All tests passed successfully!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n✗ Test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run tests
testConnection();
