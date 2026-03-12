# VerifyUS - MVP Build Tasks

## Setup & Infrastructure
- [x] Initialize Next.js project with TypeScript
- [x] Set up PostgreSQL database schema
- [x] Create Express API server
- [x] Configure environment variables and secrets
- [x] Set up Git repository structure

## zkPass Integration
- [x] Register zkPass DevHub account and create project
- [x] Create schema for US residency verification
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
- [x] Create applicants table
- [x] Create proofs table with encryption
- [x] Create verifications audit log table
- [x] Create employers table
- [x] Add database indexes for performance
- [x] Create fraud_alerts table
- [x] Create webhook_events table
- [x] Create audit_logs table
- [x] Add database triggers (auto-update timestamps, expiration)
- [x] Create database views (active_proofs, stats)
- [x] Add utility functions (get_active_proof, is_duplicate_proof)
- [x] Create setup scripts and documentation

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
