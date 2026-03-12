# VerifyUS Implementation Plan (Handoff)

## Goal
Move from strong prototype to pilot-ready verification platform for recruitment fraud filtering.

## Current State
- Core proof submission and auth blockers have been remediated.
- System still needs migration execution, test hardening, and stage-2/3 product capabilities (geolocation + bot detection) for full problem fit.

## Phase 1: Stabilize and Ship Core (1-3 days)

1. **Database migration and compatibility checks**
- Apply updated `get_active_proof(applicant_id UUID)` function in all environments.
- Validate existing API key format and issue strategy (`UUID` vs `vus_<uuid>` wrapper).

2. **Integration verification**
- Run full happy-path test:
  - `/api/v1/zkpass/session`
  - `/api/v1/zkpass/verify`
  - `/api/v1/verify`
  - `/api/v1/verify/:applicantId`
  - `/api/v1/verify/reuse`
- Validate Next.js rewrite behavior locally and in deployment.

3. **Security pass**
- Ensure `.env` and production secrets include valid zkPass config.
- Add webhook signature verification for ATS webhook endpoints.

## Phase 2: Reliability + Quality Gates (2-5 days)

1. **Test harness modernization**
- Replace script-print tests with executable integration tests (Jest/Vitest + supertest).
- Add CI workflow gating on:
  - typecheck
  - lint
  - API integration tests

2. **Lint and type debt reduction**
- Prioritize API and shared library files first.
- Remove `any` from controller/middleware hot paths.

3. **Observability baseline**
- Structured logs for verification outcomes.
- Add dashboard counters: proof valid/invalid, duplicate attempts, auth failures.

## Phase 3: Problem-Fit Expansion (1-2 weeks)

1. **Geolocation verification module**
- Add country-level presence proof signal (privacy-preserving).
- Integrate result into verification decision model.

2. **Bot risk scoring**
- Add stage-1 low-cost bot triage (IP/device/behavior heuristics).
- Route suspicious flows to stronger checks.

3. **Decision engine**
- Normalize all verification signals into a single risk decision response:
  - `allow`
  - `review`
  - `reject`

## Phase 4: Pilot Readiness (1 week)

1. **Customer-facing docs and onboarding**
- Pilot runbook, integration checklist, webhook troubleshooting.

2. **Commercial instrumentation**
- Per-applicant cost tracking by stage.
- Employer ROI reporting aligned to blocked fraud and recruiter time saved.

## Immediate Next Actions for Receiving Agent
1. Run DB migration update in target environments.
2. Execute end-to-end API flow test with real zkPass credentials.
3. Add at least one automated API integration test covering submit/status/reuse.
4. Fix remaining lint errors in `api/*`, `lib/*`, and `app/components/*`.
