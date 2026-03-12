# VerifyUS API Documentation

Complete API reference for integrating VerifyUS with your recruitment platform.

## Quick Links

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[API Reference](./API_REFERENCE.md)** - Full endpoint documentation
- **[OpenAPI Spec](./openapi.yaml)** - Machine-readable API specification
- **[Postman Collection](./postman-collection.json)** - Test endpoints with Postman

## Overview

The VerifyUS API allows you to:
- Submit and validate zero-knowledge proofs
- Check applicant verification status
- Receive webhook notifications
- Track fraud analytics

## Authentication

All API requests require an API key in the `Authorization` header:

```bash
Authorization: Bearer YOUR_API_KEY
```

Get your API key from the [employer dashboard](https://verifyus.com/employer/dashboard).

## Base URL

```
https://api.verifyus.com/api/v1
```

## Core Endpoints

### Verify Applicant
```http
POST /verify
```

Submit a zero-knowledge proof for verification.

### Check Status
```http
GET /verify/:applicant_id
```

Check if an applicant has a valid proof.

### Webhooks
```http
POST /webhooks/greenhouse
POST /webhooks/lever
```

Receive notifications from your ATS when candidates apply.

## Getting Started

1. [Sign up for an account](https://verifyus.com/employer/signup)
2. [Generate an API key](https://verifyus.com/employer/dashboard)
3. Follow the [Quick Start Guide](./QUICK_START.md)
4. Test with [Postman Collection](./postman-collection.json)

## Support

- **Email:** bird@ghostclaw.io
- **GitHub:** https://github.com/ziggythebot/verifyus/issues
- **Documentation:** https://verifyus.com/docs
