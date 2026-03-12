# Enticeable Verification System

An identity verification system for creator platforms that allows users to verify themselves once and use that verification across multiple platforms.

## Overview

This system provides:
- **User Verification**: ID verification, selfie capture, and liveness detection
- **Multi-Platform Support**: Reusable verification across multiple creator platforms
- **Secure API**: RESTful API for platform integration
- **Admin Dashboard**: Next.js frontend for managing verifications

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: Express.js API server
- **Database**: PostgreSQL
- **Storage**: AWS S3 for document storage
- **Verification**: IDology integration

## Project Structure

```
├── api/              # Express.js API server
├── app/              # Next.js frontend
├── db/               # Database schema and migrations
├── lib/              # Shared utilities and types
├── docs/             # Documentation
└── scripts/          # Build and deployment scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- AWS account (for S3)
- IDology API credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd enticeable-verification
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Initialize the database:
```bash
npm run db:migrate
```

5. Start development servers:
```bash
# Frontend (Next.js)
npm run dev

# API server (Express)
npm run api:dev
```

## Documentation

- [API Implementation Guide](./API_IMPLEMENTATION.md)
- [Environment Setup](./ENV_SETUP.md)
- [Product Specification](./product-spec.md)

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## Deployment

See deployment documentation in `/docs` for platform-specific deployment guides.

## License

Proprietary - All rights reserved
