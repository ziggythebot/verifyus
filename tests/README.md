# Proof Validation Tests

This directory contains tests for zkPass proof validation functionality.

## Test Files

### `proof-validation.test.ts`

Comprehensive test suite for zkPass proof validation with sample data.

**What it tests:**

1. **Proof Structure** - Validates that proofs have correct structure and fields can be extracted
2. **Signature Verification** - Tests cryptographic signature verification (requires environment setup)
3. **Proof Expiration** - Validates expiration date logic for proofs
4. **Proof Types** - Tests different proof types (US Passport, State ID, SSN+Address)
5. **Proof Reuse Detection** - Tests duplicate proof detection logic

## Running Tests

```bash
# Run proof validation tests
npm run test:proof

# Run all tests (environment, zkPass, and proof validation)
npm run test:all
```

## Sample Data

The test suite includes sample proof data for:

- **Valid US Passport Proof** - Complete proof with valid signature
- **Expired Proof** - Proof that has passed its expiration date
- **Invalid Proof** - Proof with wrong schema ID
- **State ID Proof** - California driver's license verification
- **SSN + Address Proof** - Social Security Number and address verification

## Environment Requirements

For full test coverage (including signature verification), set these environment variables:

```bash
export ZKPASS_APP_ID="your-app-id"
export ZKPASS_SCHEMA_ID="your-schema-id"
```

**Note:** Signature verification tests will be skipped if these variables are not set. This is expected behavior for development environments.

## Test Output

The test suite provides detailed output for each test:

```
╔════════════════════════════════════════════════════════════════╗
║        zkPass Proof Validation Test Suite                      ║
╚════════════════════════════════════════════════════════════════╝

=== Testing Proof Structure ===
✓ Valid proof has correct structure
  Task ID: 0x1234...
  Schema ID: sample-schema-id
  Public Fields: 4

...

╔════════════════════════════════════════════════════════════════╗
║                        Test Summary                             ║
╚════════════════════════════════════════════════════════════════╝
✓ Proof Structure
✓ Signature Verification
✓ Proof Expiration
✓ Proof Types
✓ Proof Reuse Detection

5/5 tests passed
```

## Integration with Controller

The validation logic tested here is used in the verify controller:

- `api/controllers/verifyController.ts` - Uses `verifyZkPassProof()` for real proof validation
- Currently has a TODO to integrate the zkPass validation (line 32-34)

## Next Steps

1. **Integrate with Controller** - Replace the `isValidProof = true` placeholder in `verifyController.ts` with actual `verifyZkPassProof()` call
2. **Add Real Proof Tests** - Test with real zkPass proofs from the DevHub
3. **Add API Integration Tests** - Test the full API flow from proof submission to verification
4. **Add Database Tests** - Test proof storage, duplicate detection, and retrieval

## Updating Sample Data

To update sample proof data, modify the constants at the top of `proof-validation.test.ts`:

- `SAMPLE_VALID_PROOF` - Valid proof template
- `SAMPLE_EXPIRED_PROOF` - Expired proof
- `SAMPLE_INVALID_PROOF` - Invalid schema
- `SAMPLE_STATE_ID_PROOF` - State ID verification
- `SAMPLE_SSN_ADDRESS_PROOF` - SSN + Address verification

## Related Documentation

- [zkPass Integration Guide](../docs/zkpass-integration.md)
- [API Documentation](../api/README.md)
- [zkPass DevHub](https://zkpass.org/devhub)
