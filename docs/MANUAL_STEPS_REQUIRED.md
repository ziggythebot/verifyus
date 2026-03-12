# Manual Steps Required: zkPass DevHub Registration

## Status: ⚠️ Manual Intervention Required

The zkPass DevHub account registration and project creation **cannot be automated** because:

1. **Wallet-based authentication**: Requires connecting a cryptocurrency wallet (MetaMask, WalletConnect, etc.) and signing authentication messages
2. **No programmatic API**: zkPass DevHub does not provide a REST API or CLI tool for project creation
3. **Browser-based only**: All registration and project creation must be done through the web interface at https://dev.zkpass.org/

## Required Manual Steps

### 1. Prepare Your Wallet

Ensure you have:
- A cryptocurrency wallet installed (MetaMask recommended)
- Wallet funded with gas fees if needed
- Access to the private key/recovery phrase (for signing)

### 2. Register zkPass DevHub Account

1. Open https://dev.zkpass.org/ in your browser
2. Click "Connect Wallet"
3. Select your wallet provider (MetaMask, WalletConnect, etc.)
4. Approve the connection in your wallet popup
5. Sign the authentication message

### 3. Create Project

1. Once logged in, click "Create Project" (or similar button)
2. Fill in project details:
   - **Name**: `Enticeable Verification`
   - **Description**: `Privacy-preserving verification system for Enticeable influencer platform`
   - **Type**: Web Application (or appropriate category)
3. Click "Create"
4. **IMPORTANT**: Copy and save the generated App ID (UUID format)

### 4. Create Schema

1. In your project dashboard, click "Add Schema"
2. Select appropriate schema category:
   - **Identity/KYC** for user verification
   - **Social Media** for influencer verification
   - **Custom** for specific requirements
3. Configure schema assertions (review carefully - cannot be modified after creation)
4. Click "Submit"
5. **IMPORTANT**: Copy and save the generated Schema ID

### 5. Update Environment Variables

After obtaining the App ID and Schema ID, update `.env`:

```bash
# Add these lines to .env file
ZKPASS_APP_ID=<your-app-id-here>
ZKPASS_SCHEMA_ID=<your-schema-id-here>
```

## What's Already Done

✅ Created documentation: `docs/zkpass-setup.md`
✅ Researched zkPass DevHub registration process
✅ Identified manual steps required
✅ Prepared environment variable template

## Next Steps After Manual Setup

Once you complete the manual steps above:

1. Run: `npm install @zkpass/transgate-js-sdk`
2. The next automated task can proceed with SDK integration
3. Implementation can continue with the obtained App ID and Schema ID

## References

- [zkPass DevHub](https://dev.zkpass.org/)
- [Quick Start Guide](https://docs.zkpass.org/developer-guides/js-sdk/quick-start)
- [TransGate JS SDK Repository](https://github.com/zkPassOfficial/Transgate-JS-SDK)
- [Tutorial Examples](https://github.com/zkPassOfficial/zkPass-tutorial-examples)

## Timeline Estimate

Manual setup should take approximately **10-15 minutes** if you have a wallet ready.

---

**Created**: 2026-03-12
**Task**: Register zkPass DevHub account and create project
**Status**: Blocked - waiting for manual user intervention
