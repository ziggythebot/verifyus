# Environment Setup Guide

This document describes how to configure environment variables for the VerifyUs project.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Generate secure secrets:
   ```bash
   # Proof encryption key (already done)
   openssl rand -hex 32
   
   # Session secret (already done)
   openssl rand -hex 32
   
   # JWT secret (already done)
   openssl rand -hex 32
   ```

3. Update `.env` with your actual values (see below)

4. Test your configuration:
   ```bash
   npm run test:env
   ```

## Required Variables

These must be configured for the application to run:

- **DATABASE_URL**: PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Example: `postgresql://ziggy@localhost:5432/verifyus`

- **PROOF_ENCRYPTION_KEY**: 64-character hex key for encrypting sensitive proof data
  - Generate with: `openssl rand -hex 32`
  - Must be exactly 64 characters

- **SESSION_SECRET**: Secret for session encryption (min 32 chars)
  - Generate with: `openssl rand -hex 32`

- **JWT_SECRET**: Secret for JWT token signing (min 32 chars)
  - Generate with: `openssl rand -hex 32`

- **NODE_ENV**: Application environment
  - Values: `development`, `production`, `test`

- **PORT** / **API_PORT**: Port for API server
  - Default: `3001`

- **API_BASE_URL**: Base URL for API
  - Development: `http://localhost:3001`
  - Production: Your deployed API URL

## Optional - zkPass Integration

Required for actual verification functionality:

- **ZKPASS_APP_ID**: Your zkPass application ID
  - Register at: https://devhub.zkpass.org
  
- **ZKPASS_SCHEMA_ID**: Schema ID for your verification flow

## Optional - ATS Integration

For Greenhouse integration:
- **GREENHOUSE_API_KEY**: API key from Greenhouse
- **GREENHOUSE_WEBHOOK_SECRET**: Secret for webhook verification

For Lever integration:
- **LEVER_API_KEY**: API key from Lever
- **LEVER_WEBHOOK_SECRET**: Secret for webhook verification

## Optional - Rate Limiting

- **REDIS_URL**: Redis connection string for rate limiting
  - Format: `redis://user:password@host:port`
  - Not required in development

## Optional - Email Notifications

- **SMTP_HOST**: SMTP server hostname
- **SMTP_PORT**: SMTP server port (default: 587)
- **SMTP_USER**: SMTP authentication username
- **SMTP_PASSWORD**: SMTP authentication password
- **FROM_EMAIL**: Email address for outgoing notifications

## Optional - Monitoring

- **SENTRY_DSN**: Sentry DSN for error tracking
- **LOG_LEVEL**: Logging level (`debug`, `info`, `warn`, `error`)

## Optional - Blockchain

For on-chain proof registry:
- **BLOCKCHAIN_ENABLED**: Enable blockchain features (`true`/`false`)
- **BLOCKCHAIN_NETWORK**: Network name (e.g., `polygon`)
- **BLOCKCHAIN_RPC_URL**: RPC endpoint URL
- **BLOCKCHAIN_PRIVATE_KEY**: Private key for transactions

## Validation

The application validates all environment variables on startup using Zod schemas.

Run the validation test:
```bash
npm run test:env
```

This will:
- ✅ Validate all required variables are present and correctly formatted
- ⚠️  Warn about missing optional variables
- ❌ Exit with error if validation fails

## Security Notes

1. **Never commit `.env` to version control** - it's already in `.gitignore`
2. **Rotate secrets regularly** in production
3. **Use different secrets** for development and production
4. **Store production secrets** in your deployment platform (Railway, Vercel, etc.)
5. **Keep encryption keys secure** - lost keys mean lost data

## Deployment

### Railway / Render / Heroku

Set environment variables in the platform dashboard. Most platforms support:
- Bulk import from `.env` file
- Secret rotation
- Environment-specific variables

### Vercel

Add environment variables in project settings:
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development as needed

### Docker

Use `--env-file` flag:
```bash
docker run --env-file .env your-image
```

Or pass individual variables:
```bash
docker run -e DATABASE_URL="..." -e PROOF_ENCRYPTION_KEY="..." your-image
```
