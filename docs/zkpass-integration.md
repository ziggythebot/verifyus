# zkPass TransGate SDK Integration

This document describes the zkPass TransGate SDK integration for US residency verification.

## Overview

The zkPass TransGate SDK enables privacy-preserving verification of US residency using zero-knowledge proofs. Users can prove they are US residents without revealing personal information.

## Installation

The zkPass TransGate SDK has been installed:

```bash
npm install @zkpass/transgate-js-sdk
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# zkPass Configuration
ZKPASS_APP_ID=your-zkpass-app-id
ZKPASS_SCHEMA_ID=your-schema-id
```

**How to obtain these values:**

1. Sign up at [zkPass DevHub](https://devhub.zkpass.org/)
2. Create a new project
3. Create a schema for US residency verification
4. Copy the App ID and Schema ID

### API Endpoints

The following API endpoints are available:

#### GET `/api/v1/zkpass/session`

Get zkPass session configuration for client-side verification.

**Response:**
```json
{
  "appId": "your-app-id",
  "schemaId": "your-schema-id"
}
```

#### POST `/api/v1/zkpass/verify`

Verify a zkPass proof.

**Request:**
```json
{
  "proof": {
    "allocatorAddress": "...",
    "allocatorSignature": "...",
    "publicFields": [...],
    "publicFieldsHash": "...",
    "taskId": "...",
    "uHash": "...",
    "validatorAddress": "...",
    "validatorSignature": "..."
  },
  "schemaId": "your-schema-id",
  "chainType": "evm"
}
```

**Response:**
```json
{
  "valid": true,
  "publicFields": [...]
}
```

#### GET `/api/v1/zkpass/health`

Check zkPass configuration status.

**Response:**
```json
{
  "configured": true,
  "appId": "set",
  "schemaId": "set"
}
```

## Usage

### Server-Side (Node.js/TypeScript)

```typescript
import { verifyZkPassProof, extractPublicFields } from '../lib/zkpass';
import type { Result } from '@zkpass/transgate-js-sdk/lib/types';

// Verify a proof
const isValid = await verifyZkPassProof(
  proof as Result,
  'your-schema-id',
  'evm'
);

if (isValid) {
  const publicFields = extractPublicFields(proof);
  console.log('Verification successful:', publicFields);
}
```

### Client-Side (React)

```tsx
import { useZkPass } from '../lib/hooks/useZkPass';

function VerificationComponent() {
  const { launch, isLoading, result, error } = useZkPass({
    appId: 'your-app-id',
    schemaId: 'your-schema-id',
    onSuccess: (result) => {
      console.log('Verification successful:', result);
      // Submit to backend for verification
    },
    onError: (error) => {
      console.error('Verification failed:', error);
    },
  });

  return (
    <button onClick={() => launch('0x1234...')} disabled={isLoading}>
      {isLoading ? 'Verifying...' : 'Verify US Residency'}
    </button>
  );
}
```

### Using the Pre-built Component

```tsx
import ZkPassVerification from './components/ZkPassVerification';

function App() {
  return (
    <ZkPassVerification
      walletAddress="0x1234..."
      onVerificationComplete={(result) => {
        console.log('Verification complete:', result);
      }}
      onVerificationError={(error) => {
        console.error('Verification error:', error);
      }}
    />
  );
}
```

## Architecture

### Files Structure

```
├── lib/
│   ├── zkpass.ts                    # Server-side zkPass utilities
│   ├── hooks/
│   │   └── useZkPass.ts             # React hook for client-side
│   └── types/
│       └── zkpass.ts                # TypeScript type definitions
├── api/
│   └── routes/
│       └── zkpass.ts                # API endpoints
└── app/
    └── components/
        └── ZkPassVerification.tsx   # Pre-built verification component
```

### Data Flow

1. **Client requests verification**
   - User clicks "Verify US Residency"
   - Client fetches zkPass config from `/api/v1/zkpass/session`

2. **TransGate launches**
   - zkPass TransGate SDK launches (app or extension)
   - User completes verification in TransGate

3. **Proof generation**
   - TransGate generates zero-knowledge proof
   - Proof is returned to client

4. **Backend verification**
   - Client submits proof to `/api/v1/zkpass/verify`
   - Server verifies proof cryptographically
   - Public fields are extracted (if valid)

5. **Result stored**
   - Verification result is stored in database
   - User is marked as verified

## Security Considerations

1. **Never expose private keys**: The zkPass App ID is safe to expose client-side, but keep any private keys secure.

2. **Always verify on backend**: Client-side verification alone is not sufficient. Always verify proofs on your backend.

3. **Validate public fields**: Ensure public fields match your expected schema structure.

4. **Rate limiting**: The verification endpoints are protected by rate limiting middleware.

5. **Proof freshness**: Consider adding timestamp validation to ensure proofs aren't replayed.

## Testing

### Health Check

Verify your zkPass configuration:

```bash
curl http://localhost:3001/api/v1/zkpass/health
```

### Manual Verification Flow

1. Start the API server:
   ```bash
   npm run api:dev
   ```

2. Start the Next.js app:
   ```bash
   npm run dev
   ```

3. Navigate to the verification page and click "Verify US Residency"

4. Complete verification in TransGate

5. Check the console and network tab for proof submission and verification

## Troubleshooting

### "TransGate Not Available"

- Ensure user has zkPass browser extension installed or is using zkPass mobile app
- Check browser console for errors

### "Proof verification failed"

- Verify `ZKPASS_APP_ID` and `ZKPASS_SCHEMA_ID` are correct
- Ensure the schema matches the proof being verified
- Check backend logs for detailed error messages

### "Failed to load zkPass config"

- Verify environment variables are set in `.env`
- Restart API server after changing `.env`
- Check `/api/v1/zkpass/health` endpoint

## Resources

- [zkPass Documentation](https://docs.zkpass.org/)
- [zkPass DevHub](https://devhub.zkpass.org/)
- [TransGate SDK GitHub](https://github.com/zkPassOfficial/Transgate-JS-SDK)
- [zkPass Discord](https://discord.gg/zkpass)

## Next Steps

1. **Configure Schema**: Update your zkPass schema in DevHub to match US residency requirements
2. **Update Environment**: Add your actual `ZKPASS_APP_ID` and `ZKPASS_SCHEMA_ID` to `.env`
3. **Test Integration**: Run through the verification flow end-to-end
4. **Integrate with Database**: Store verification results in PostgreSQL
5. **Add to Verification Flow**: Integrate component into main verification page
