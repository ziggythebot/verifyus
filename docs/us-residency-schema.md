# US Residency Verification Schema

## Overview

This document defines the zkPass schema for verifying US work authorization and residency. The schema supports multiple verification methods to accommodate different applicant circumstances.

## Schema Purpose

**Prove**: The applicant is authorized to work in the United States

**Without revealing**: Full identity details, document numbers, or sensitive personal information

## Verification Methods

### Method 1: US Passport

**Data Source**: USCIS Electronic Passport Database (via zkTLS)

**Required Assertions**:
- `document_type` = "US_PASSPORT"
- `citizenship` = "USA"
- `document_status` = "VALID"
- `expiration_date` > current_date
- `holder_age` >= 16

**Zero-Knowledge Proof Output**:
```json
{
  "proof_type": "us_passport",
  "is_valid": true,
  "is_us_citizen": true,
  "verified_at": "2026-03-12T00:00:00Z",
  "expires_at": "2026-06-10T00:00:00Z"
}
```

**Data NOT Revealed**:
- Full name
- Passport number
- Date of birth
- Place of birth
- Photograph

---

### Method 2: State-Issued ID / Driver's License

**Data Source**: State DMV databases (via zkTLS to DMV verification portals)

**Required Assertions**:
- `document_type` IN ["DRIVERS_LICENSE", "STATE_ID"]
- `issuing_state` IN [list of US states]
- `document_status` = "VALID"
- `expiration_date` > current_date
- `address_state` IN [list of US states]
- `holder_age` >= 16

**Zero-Knowledge Proof Output**:
```json
{
  "proof_type": "state_id",
  "is_valid": true,
  "has_us_address": true,
  "verified_at": "2026-03-12T00:00:00Z",
  "expires_at": "2026-06-10T00:00:00Z"
}
```

**Data NOT Revealed**:
- Full name
- ID number
- Date of birth
- Full address (only state)
- Photograph

---

### Method 3: SSN + Address Verification

**Data Source**: USPS Address Verification API + SSN validation service

**Required Assertions**:
- `ssn_issued` = true
- `ssn_valid` = true
- `address_deliverable` = true
- `address_country` = "USA"
- `address_residential` = true

**Zero-Knowledge Proof Output**:
```json
{
  "proof_type": "ssn_address",
  "is_valid": true,
  "has_valid_ssn": true,
  "has_us_address": true,
  "verified_at": "2026-03-12T00:00:00Z",
  "expires_at": "2026-06-10T00:00:00Z"
}
```

**Data NOT Revealed**:
- Full SSN (only validation status)
- Full address (only country + residential status)
- Name

---

### Method 4: US Bank Account

**Data Source**: Plaid API (bank account verification)

**Required Assertions**:
- `account_status` = "ACTIVE"
- `account_country` = "USA"
- `account_type` IN ["CHECKING", "SAVINGS"]
- `routing_number_country` = "USA"
- `account_age_days` >= 90

**Zero-Knowledge Proof Output**:
```json
{
  "proof_type": "bank_account",
  "is_valid": true,
  "has_us_bank_account": true,
  "account_age_sufficient": true,
  "verified_at": "2026-03-12T00:00:00Z",
  "expires_at": "2026-06-10T00:00:00Z"
}
```

**Data NOT Revealed**:
- Account number
- Routing number
- Bank name
- Account balance
- Transaction history

---

## zkPass Schema Configuration

### Schema Metadata

```json
{
  "schema_name": "US Work Authorization Verification",
  "schema_version": "1.0.0",
  "description": "Verify US work authorization without revealing identity details",
  "category": "Identity/KYC",
  "issuer": "VerifyUS by Enticeable",
  "valid_duration_days": 90
}
```

### Composite Schema Structure

The schema should support multiple verification methods as alternatives (OR logic):

```
US_WORK_AUTH_VERIFICATION =
  US_PASSPORT
  OR STATE_ID
  OR SSN_ADDRESS
  OR BANK_ACCOUNT
```

### Implementation in zkPass DevHub

When creating the schema in the DevHub interface:

1. **Select Schema Type**: Custom Identity Verification
2. **Add Assertion Groups** (one per method):
   - Group 1: US Passport
   - Group 2: State ID / Driver's License
   - Group 3: SSN + Address
   - Group 4: US Bank Account
3. **Set Logic**: Any one group must pass (OR logic)
4. **Configure TTL**: 90 days
5. **Privacy Settings**: Enable selective disclosure

### Data Source Integrations

#### zkTLS Endpoints (to be configured in zkPass)

- **US Passport**: `https://passportverify.uscis.gov/api/validate`
- **State DMV**: State-specific endpoints (e.g., `https://dmv.ca.gov/api/verify`)
- **USPS Address**: `https://tools.usps.com/go/ZipLookupAction`
- **Plaid**: `https://production.plaid.com/auth/get` (requires API key)

#### zkPass Data Connectors

For each data source, zkPass should:
1. Establish zkTLS connection to authoritative source
2. Extract relevant fields (encrypted client-side)
3. Evaluate assertions without revealing raw data
4. Generate cryptographic proof of validity

---

## Security Properties

### Cryptographic Guarantees

✅ **Zero-knowledge**: Verifier learns only "US work auth = valid", nothing else
✅ **Non-transferable**: Proof bound to applicant (device fingerprint + nonce)
✅ **Time-limited**: Proof expires after 90 days, requires re-verification
✅ **Tamper-proof**: Cryptographic signature prevents modification
✅ **Replay-resistant**: Unique nonce per verification prevents proof reuse across different employers

### Privacy Compliance

- **GDPR Article 5**: Data minimization (only prove work auth, not full identity)
- **GDPR Article 25**: Privacy by design (zero-knowledge by default)
- **CCPA**: User controls when/where proof is shared
- **EEOC**: Cannot be used for discriminatory hiring (only proves work auth)

---

## Testing Plan

### Test Cases

1. **Valid US Passport**: Should generate valid proof
2. **Expired Passport**: Should reject
3. **Foreign Passport**: Should reject
4. **Valid State ID (CA)**: Should generate valid proof
5. **Valid State ID (NY)**: Should generate valid proof
6. **Expired Driver's License**: Should reject
7. **Valid SSN + US Address**: Should generate valid proof
8. **Valid SSN + Foreign Address**: Should reject
9. **US Bank Account (6 months old)**: Should generate valid proof
10. **US Bank Account (<90 days old)**: Should reject
11. **Foreign Bank Account**: Should reject

### Test Data

Use zkPass sandbox environment with test credentials:
- Test passport number: `123456789` (always valid)
- Test state ID: CA DMV sandbox
- Test SSN: `123-45-6789` (USPS sandbox)
- Test bank: Plaid sandbox account

---

## API Integration

### Proof Validation Endpoint

```typescript
POST /api/v1/verify

Request:
{
  "applicant_id": "uuid",
  "proof": "zkproof_base64_encoded",
  "employer_id": "uuid"
}

Response:
{
  "verified": true,
  "proof_type": "us_passport",
  "verified_at": "2026-03-12T00:00:00Z",
  "expires_at": "2026-06-10T00:00:00Z",
  "confidence_score": 0.98,
  "verification_id": "uuid"
}
```

### Proof Structure

```typescript
interface ZKProof {
  version: string; // "1.0.0"
  schema_id: string; // zkPass schema ID
  proof_type: "us_passport" | "state_id" | "ssn_address" | "bank_account";
  assertions_passed: string[]; // List of passed assertions
  proof_data: string; // Base64-encoded cryptographic proof
  generated_at: number; // Unix timestamp
  expires_at: number; // Unix timestamp
  nonce: string; // Unique per verification
  signature: string; // ECDSA signature
}
```

---

## Migration Path

### Phase 1: MVP (Single Method)

Start with **US Passport only** for simplicity:
- Single assertion group
- Fastest to implement
- Covers majority of use cases

### Phase 2: Multi-Method (Weeks 4-6)

Add State ID and Bank Account:
- Expand schema to support OR logic
- Test with multiple data sources
- Handle edge cases

### Phase 3: Advanced (Weeks 8-12)

Add SSN verification + enhanced security:
- Device fingerprinting
- Behavioral analysis
- Fraud scoring

---

## Open Questions

❓ **Does zkPass support OR logic across assertion groups?**
→ Need to verify in zkPass DevHub documentation

❓ **Can we access State DMV databases via zkTLS?**
→ May require direct API partnerships with states

❓ **What's the cost per proof generation?**
→ zkPass pricing model unclear, may need custom quote

❓ **How to handle international work visas (H1B, etc.)?**
→ Post-MVP: add visa verification assertion group

---

## References

- [zkPass Documentation](https://docs.zkpass.org/)
- [zkTLS Protocol](https://docs.zkpass.org/developer-guides/zktls/overview)
- [TransGate SDK](https://github.com/zkPassOfficial/Transgate-JS-SDK)
- [USCIS Passport Verification](https://www.uscis.gov/e-verify)
- [USPS Address Verification API](https://www.usps.com/business/web-tools-apis/)
- [Plaid Auth API](https://plaid.com/docs/auth/)

---

**Document Version**: 1.0.0
**Created**: 2026-03-12
**Last Updated**: 2026-03-12
**Owner**: VerifyUS Engineering Team
