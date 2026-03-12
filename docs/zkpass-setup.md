# zkPass DevHub Setup Guide

This guide covers registering a zkPass DevHub account and creating a project for the Enticeable Verification system.

## Prerequisites

- A cryptocurrency wallet (MetaMask, WalletConnect, etc.)
- Funded wallet for blockchain transactions (if needed)

## Step 1: Register zkPass DevHub Account

1. Navigate to [zkPass DevHub](https://dev.zkpass.org/)
2. Click "Connect Wallet" button
3. Select your wallet provider (MetaMask, WalletConnect, etc.)
4. Approve the connection request in your wallet
5. Sign the authentication message to complete login

**Note**: zkPass uses wallet-based authentication instead of traditional email/password registration.

## Step 2: Create a New Project

1. Once logged in, click "Create Project" or similar button
2. Enter project information:
   - **Project Name**: Enticeable Verification
   - **Description**: Privacy-preserving verification system for Enticeable influencer platform
   - **Type**: Web Application
3. Click "Create" to submit
4. Save the generated **App ID** (UUID format, e.g., `8fb9d43c-2f24-424e-a98d-7ba34a5532f5`)

## Step 3: Add Schema

**IMPORTANT**: Before creating the schema in DevHub, review the detailed schema specification in `docs/us-residency-schema.md` and the configuration blueprint in `docs/zkpass-schema-config.json`.

### Schema Overview

The US Work Authorization Verification schema supports **4 verification methods** (OR logic):
1. **US Passport** (recommended for MVP)
2. **State ID / Driver's License**
3. **SSN + Address Verification**
4. **US Bank Account** (90+ days old)

### Creating the Schema (MVP - Passport Only)

For the MVP, start with **US Passport verification only**:

1. In your project dashboard, click "Add Schema"
2. Select schema category: **Identity/KYC**
3. Schema name: `US Work Authorization Verification`
4. Schema description: `Verify US work authorization without revealing identity details`
5. Configure **Assertion Group 1: US Passport**:
   - Data source type: `zkTLS`
   - Data source endpoint: USCIS Passport Database (or test endpoint)
   - Add assertions:
     - `document_type` equals `"US_PASSPORT"` (required)
     - `citizenship` equals `"USA"` (required)
     - `document_status` equals `"VALID"` (required)
     - `expiration_date` greater than `current_date` (required)
     - `holder_age` greater than or equal to `16` (required)
6. Configure **Selective Disclosure**:
   - Revealed fields: NONE
   - Hidden fields: full_name, passport_number, date_of_birth, place_of_birth, photograph
7. Set **Proof TTL**: 90 days
8. Review carefully - **schemas cannot be modified after creation** (only deleted)
9. Click "Submit" to create the schema
10. **IMPORTANT**: Save the generated **Schema ID**

### Adding Additional Methods (Post-MVP)

After validating the passport method works, you can create additional schemas or extend the existing one to support:
- State ID / Driver's License (see `docs/zkpass-schema-config.json` for assertions)
- SSN + Address Verification (see `docs/zkpass-schema-config.json` for assertions)
- Bank Account Verification (see `docs/zkpass-schema-config.json` for assertions)

Refer to `docs/us-residency-schema.md` for complete specification of each method.

## Step 4: Configure Environment Variables

Add the following to your `.env` file:

```env
# zkPass Configuration
ZKPASS_APP_ID=your-app-id-here
ZKPASS_SCHEMA_ID=your-schema-id-here
```

## Schema Documentation

**Internal Documentation** (created for this project):
- [`docs/us-residency-schema.md`](./us-residency-schema.md) - Complete schema specification with all 4 verification methods
- [`docs/zkpass-schema-config.json`](./zkpass-schema-config.json) - Machine-readable schema blueprint
- [`lib/types/zkproof.ts`](../lib/types/zkproof.ts) - TypeScript type definitions for proof validation

**External Resources**:
- [zkPass Documentation](https://docs.zkpass.org/)
- [Quick Start Guide](https://docs.zkpass.org/developer-guides/js-sdk/quick-start)
- [TransGate JS SDK](https://github.com/zkPassOfficial/Transgate-JS-SDK)
- [Tutorial Examples](https://github.com/zkPassOfficial/zkPass-tutorial-examples)

## Next Steps

After completing the DevHub setup:

1. Install the zkPass SDK: `npm install @zkpass/transgate-js-sdk`
2. Implement verification flows in the API
3. Test with the TransGate browser extension
4. Deploy to production

## Support

- [zkPass DevHub](https://dev.zkpass.org/)
- [zkPass Documentation](https://docs.zkpass.org/)

---

**Sources**:
- [zkPass DevHub](https://dev.zkpass.org/)
- [Quick Start Guide](https://docs.zkpass.org/developer-guides/js-sdk/quick-start)
- [TransGate JS SDK](https://github.com/zkPassOfficial/Transgate-js-SDK)
