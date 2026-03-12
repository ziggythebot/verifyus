# Environment Variables Setup Guide

## Overview

This project uses three environment files:

1. **`.env`** - Main configuration file for both API and database
2. **`.env.local`** - Next.js frontend-specific variables (Git-ignored)
3. **`api/.env.api`** - Documentation of API-specific variables

## Initial Setup

### 1. Core Secrets (Already Configured)

✅ **DATABASE_URL** - PostgreSQL connection string (using local user)
✅ **PROOF_ENCRYPTION_KEY** - 64-character hex key for encrypting stored proofs
✅ **SESSION_SECRET** - Session encryption key
✅ **JWT_SECRET** - JWT token signing key

### 2. Required Configuration (To Do)

#### zkPass Integration
Before you can verify US residency, you need:

1. Register at [zkPass DevHub](https://devhub.zkpass.org)
2. Create a new project
3. Create a schema for US residency verification
4. Get your credentials and update `.env`:

```bash
ZKPASS_APP_ID=your-actual-app-id-here
ZKPASS_SCHEMA_ID=your-actual-schema-id-here
```

Also update `.env.local`:
```bash
NEXT_PUBLIC_ZKPASS_APP_ID=your-actual-app-id-here
```

### 3. Optional Integrations

#### ATS Integration (Greenhouse/Lever)
For automated applicant verification:

```bash
GREENHOUSE_API_KEY=your-api-key
GREENHOUSE_WEBHOOK_SECRET=webhook-secret
LEVER_API_KEY=your-api-key
LEVER_WEBHOOK_SECRET=webhook-secret
```

#### Redis (Rate Limiting & Caching)
For production use:

```bash
REDIS_URL=redis://user:password@host:port
```

#### Email Notifications
Configure SMTP for sending verification emails:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=noreply@verifyus.com
```

#### Monitoring
For error tracking and logging:

```bash
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info  # debug|info|warn|error
```

#### Blockchain (Optional - Future)
For on-chain proof registry:

```bash
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=polygon
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
BLOCKCHAIN_PRIVATE_KEY=your-private-key
```

## Security Best Practices

### Git Ignore
The following files are already in `.gitignore`:
- `.env`
- `.env.local`
- `.env*.local`

### Never Commit
- Real API keys
- Database passwords
- Private keys
- Encryption keys

### Production Deployment

When deploying, set environment variables in your platform:

**Vercel (Frontend)**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ZKPASS_APP_ID`

**Railway/Render (Backend)**
- All variables from `.env`
- Update `DATABASE_URL` to production database
- Update `API_BASE_URL` to production API URL

## Testing

Test your configuration:

```bash
# Test database connection
npm run db:migrate

# Start API server (should load .env)
cd api && npm run dev

# Start Next.js frontend (loads .env.local)
npm run dev
```

## Current Status

### ✅ Configured
- Database connection
- Encryption keys
- Session/JWT secrets
- Basic API configuration

### ⏳ Needs Setup
- zkPass credentials (required for verification)
- ATS integration (optional, for pilot customers)
- Redis (optional, recommended for production)
- Email configuration (optional, for notifications)

## Next Steps

1. **Register zkPass account** and get credentials
2. Update zkPass variables in `.env` and `.env.local`
3. Test proof generation with zkPass SDK
4. (Optional) Set up Redis for rate limiting
5. (Optional) Configure SMTP for email notifications
