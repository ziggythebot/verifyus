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

1. In your project dashboard, click "Add Schema"
2. Choose the schema category appropriate for your use case:
   - For identity verification: Identity/KYC schemas
   - For social media verification: Social Media schemas
   - For custom data: Custom schema templates
3. Configure schema assertions according to your requirements
4. Review carefully - **schemas cannot be modified after creation** (only deleted)
5. Click "Submit" to create the schema
6. Save the generated **Schema ID**

## Step 4: Configure Environment Variables

Add the following to your `.env` file:

```env
# zkPass Configuration
ZKPASS_APP_ID=your-app-id-here
ZKPASS_SCHEMA_ID=your-schema-id-here
```

## Integration Resources

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
