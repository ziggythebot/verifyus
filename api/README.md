# VerifyUS API Server

Express-based REST API for the VerifyUS verification platform.

## Overview

The API server handles:
- ZK proof submission and validation
- Verification status checks
- Proof reuse across job applications
- Greenhouse/Lever webhook processing
- Employer analytics and fraud detection

## Architecture

```
api/
├── server.ts              # Express app setup
├── controllers/           # Request handlers
│   ├── verifyController.ts
│   ├── webhookController.ts
│   └── analyticsController.ts
├── routes/                # Route definitions
│   ├── verify.ts
│   ├── webhooks.ts
│   └── analytics.ts
└── middleware/            # Express middleware
    ├── auth.ts
    ├── errorHandler.ts
    └── rateLimiter.ts
```

## API Endpoints

### Verification Routes

#### `POST /api/v1/verify`
Submit a new ZK proof for verification.

**Request:**
```json
{
  "email": "applicant@example.com",
  "proofData": "zkpass_proof_string",
  "proofType": "us_passport",
  "metadata": {
    "deviceId": "...",
    "ipAddress": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "applicantId": "uuid",
  "proofId": "uuid",
  "verified": true,
  "expiresAt": "2024-06-10T...",
  "message": "Verification successful"
}
```

#### `GET /api/v1/verify/:applicantId`
Check verification status for an applicant.

**Response:**
```json
{
  "verified": true,
  "applicantId": "uuid",
  "proofType": "us_passport",
  "verifiedAt": "2024-03-10T...",
  "expiresAt": "2024-06-10T...",
  "confidenceScore": 0.95
}
```

#### `POST /api/v1/verify/reuse`
Reuse an existing proof for a new job application.

**Request:**
```json
{
  "applicantId": "uuid",
  "jobId": "job-123",
  "employerId": "employer-uuid"
}
```

**Response:**
```json
{
  "verified": true,
  "reused": true,
  "proofId": "uuid",
  "expiresAt": "2024-06-10T...",
  "message": "Existing verification reused successfully"
}
```

### Webhook Routes

#### `POST /api/v1/webhooks/greenhouse`
Handle Greenhouse `candidate.created` events.

**Webhook Payload:**
```json
{
  "action": "candidate_created",
  "payload": {
    "candidate_id": "12345",
    "email": "applicant@example.com"
  }
}
```

**Actions:**
- ✅ Active verification found → Update candidate with verification status
- ⚠️ Expired verification → Reject candidate
- ❌ No verification → Flag candidate

### Analytics Routes (Requires Auth)

All analytics routes require `X-API-Key` header.

#### `GET /api/v1/analytics/stats`
Get employer verification statistics.

**Response:**
```json
{
  "employerId": "uuid",
  "period": "all_time",
  "verifications": {
    "total_verifications": 1250,
    "unique_applicants": 980,
    "verified_count": 1180,
    "rejected_count": 70
  },
  "fraudAlerts": {
    "total_alerts": 15,
    "high_severity": 5,
    "medium_severity": 8,
    "low_severity": 2
  },
  "activeProofs": 850
}
```

#### `GET /api/v1/analytics/trends?days=30`
Get verification trends over time.

#### `GET /api/v1/analytics/fraud-alerts?severity=high&limit=50`
Get fraud alerts.

## Authentication

### API Key Format
```
vus_live_abc123...
vus_test_xyz789...
```

Include in headers:
```
X-API-Key: vus_live_abc123...
```

## Running the Server

### Development
```bash
npm run api:dev
```

Runs on `http://localhost:3001` with hot reload.

### Production
```bash
npm run api:build
npm run api:start
```

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `PROOF_ENCRYPTION_KEY` - 64-char hex string (32 bytes)

Optional:
- `API_PORT` - Server port (default: 3001)
- `ALLOWED_ORIGINS` - CORS origins (comma-separated)
- `RATE_LIMIT` - Requests per window (default: 100)
- `RATE_LIMIT_WINDOW` - Window in ms (default: 60000)
- `ZKPASS_APP_ID` - zkPass application ID
- `GREENHOUSE_API_KEY` - Greenhouse API key

## Security Features

### Rate Limiting
- 100 requests per minute per IP (configurable)
- In-memory store (use Redis for production)

### Proof Encryption
- AES-256-CBC encryption at rest
- Random IV per proof
- Encrypted format: `{iv}:{ciphertext}`

### Fraud Detection
- Duplicate proof detection
- Device fingerprinting
- Behavioral analysis
- Audit logging

## Database Functions Used

The API leverages PostgreSQL functions:
- `get_active_proof(applicant_id)` - Get non-expired proof
- `is_duplicate_proof(proof_hash)` - Check for duplicates

## Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-03-12T...",
  "uptime": 12345
}
```

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message",
  "details": { ... },
  "stack": "..." // development only
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Testing

```bash
# Submit a verification
curl -X POST http://localhost:3001/api/v1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "proofData": "test_proof_data",
    "proofType": "us_passport"
  }'

# Check status
curl http://localhost:3001/api/v1/verify/{applicantId}

# Get analytics (with auth)
curl http://localhost:3001/api/v1/analytics/stats \
  -H "X-API-Key: vus_test_xyz"
```

## Next Steps

- [ ] Implement zkPass proof validation
- [ ] Add Greenhouse API integration
- [ ] Implement Redis-based rate limiting
- [ ] Add JWT authentication
- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Add unit and integration tests
- [ ] Set up monitoring (Sentry)
