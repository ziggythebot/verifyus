# zkPass DevHub Setup Guide

## Registration Steps

### 1. Access DevHub
- Navigate to https://dev.zkpass.org/
- Click "Connect Wallet" or login button
- **Authentication Method**: Wallet-based (MetaMask, WalletConnect, etc.)
- No email/password signup available - must use Web3 wallet

### 2. Create Project
Once logged in:
1. Click "Create New Project"
2. Fill in project details:
   - **Project Name**: Enticeable Email Verification
   - **Domain**: `localhost:3000` (development) or your production domain
   - **Contact Info**: Your email
   - **Description**: Privacy-preserving email verification system using zkPass TransGate
   - **Verification Type**: Custom data verification (email)

3. Click "Create" → System generates **appID** (save this!)

### 3. Add Schema
1. In your project dashboard, click "Add Schema"
2. Choose schema category: **Custom Schema**
3. Select base schema template or create custom
4. Configure assertions for email verification:
   - Email existence check
   - Domain validation
   - Optional: email activity/age verification

5. Submit → System generates **schemaId** (save this!)

### 4. Configuration Output
After creation, you'll receive:
- **appID**: Unique project identifier
- **schemaId**: Unique schema identifier for email verification

These will be added to `.env` file:
```
ZKPASS_APP_ID=your_app_id_here
ZKPASS_SCHEMA_ID=your_schema_id_here
```

## Important Notes
- Domain in DevHub **must match** the domain where you'll use TransGate
- Schemas cannot be modified after creation (but can be deleted and recreated)
- Multiple schemas can be added to one project
- Keep appID and schemaId secure

## Next Steps After Registration
1. Save appID and schemaId to `.env`
2. Install TransGate JS-SDK: `npm install @zkpass/transgate-js-sdk`
3. Integrate verification flow in frontend
4. Test with zkPass browser extension

## Manual Action Required
**This step requires manual completion** because:
- Wallet authentication cannot be automated
- DevHub interface requires interactive wallet connection
- Browser extension interaction needed for schema creation

Please complete registration manually and update `.env` with credentials.
