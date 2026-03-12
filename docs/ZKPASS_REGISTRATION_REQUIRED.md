# ⚠️ Manual Action Required: zkPass DevHub Registration

## Status
zkPass DevHub account registration **cannot be automated** due to wallet-based authentication requirements.

## What Was Done
✅ Created setup documentation at `docs/zkpass-setup.md`
✅ Added zkPass environment variables to `.env.example`
✅ Documented registration process and configuration steps

## What You Need to Do

### Step 1: Connect Wallet & Register
1. Visit https://dev.zkpass.org/
2. Connect your Web3 wallet (MetaMask, WalletConnect, etc.)
3. Complete authentication

### Step 2: Create Project
Fill in:
- **Name**: Enticeable Email Verification
- **Domain**: `localhost:3000` (or your domain)
- **Description**: Privacy-preserving email verification system
- Save the generated **appID**

### Step 3: Create Schema
1. Add custom schema for email verification
2. Configure assertions (email validation, domain check)
3. Save the generated **schemaId**

### Step 4: Update Environment
Add to your `.env` file:
```bash
ZKPASS_APP_ID=<your_app_id>
ZKPASS_SCHEMA_ID=<your_schema_id>
```

## Why Manual Completion is Required
- DevHub uses wallet-based authentication (Web3)
- No API for automated account creation
- Browser extension interaction needed
- Wallet signing required for project creation

## Resources
- 📚 Full guide: `docs/zkpass-setup.md`
- 🌐 DevHub: https://dev.zkpass.org/
- 📖 Documentation: https://docs.zkpass.org/developer-guides/js-sdk/quick-start

## Next Task
After completing registration and updating `.env`, the next step will be installing the TransGate JS-SDK and integrating the verification flow.
