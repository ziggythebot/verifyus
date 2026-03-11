# VerifyUS - MVP Build Tasks

## Setup & Infrastructure
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up PostgreSQL database schema
- [ ] Create Express API server
- [ ] Configure environment variables and secrets
- [ ] Set up Git repository structure

## zkPass Integration
- [ ] Register zkPass DevHub account and create project
- [ ] Create schema for US residency verification
- [ ] Install and configure zkPass TransGate SDK
- [ ] Build proof generation component
- [ ] Test proof validation with sample data

## Frontend - Verification Widget
- [ ] Create Next.js verification widget component
- [ ] Build applicant verification flow UI
- [ ] Implement proof submission to API
- [ ] Add loading states and error handling
- [ ] Make widget embeddable (script tag)

## Frontend - Applicant Dashboard
- [ ] Create applicant authentication system
- [ ] Build dashboard showing verification status
- [ ] Display proof expiration date
- [ ] Add re-verification flow
- [ ] Generate downloadable verification certificate

## Frontend - Employer Dashboard
- [ ] Create employer authentication system
- [ ] Build API key generation interface
- [ ] Display verification statistics
- [ ] Show verified vs unverified applicants list
- [ ] Add analytics dashboard

## Backend API
- [ ] Create POST /api/v1/verify endpoint
- [ ] Create GET /api/v1/verify/:id endpoint
- [ ] Implement proof validation logic
- [ ] Add proof encryption at rest
- [ ] Build proof reuse detection

## Database
- [ ] Create applicants table
- [ ] Create proofs table with encryption
- [ ] Create verifications audit log table
- [ ] Create employers table
- [ ] Add database indexes for performance

## Greenhouse Integration
- [ ] Set up Greenhouse API credentials
- [ ] Create webhook endpoint for candidate.created
- [ ] Implement candidate rejection logic
- [ ] Add custom field for verification status
- [ ] Test webhook flow end-to-end

## Security & Performance
- [ ] Implement rate limiting
- [ ] Add API key authentication
- [ ] Set up audit logging
- [ ] Implement device fingerprinting
- [ ] Add duplicate proof detection

## Testing
- [ ] Write unit tests for proof validation
- [ ] Create integration tests for Greenhouse API
- [ ] Build E2E tests for applicant flow
- [ ] Perform load testing (1000 concurrent verifications)
- [ ] Test proof reuse across multiple applications

## Deployment
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway
- [ ] Set up PostgreSQL on Supabase
- [ ] Configure Redis on Upstash
- [ ] Set up CloudFlare CDN

## Documentation & Pilot Prep
- [ ] Create API documentation
- [ ] Write employer onboarding guide
- [ ] Build demo video (2 min walkthrough)
- [ ] Create ROI calculator
- [ ] Prepare pilot customer materials
