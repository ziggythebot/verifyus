-- VerifyUS Database Schema
-- PostgreSQL 16+
-- Created: 2026-03-11

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- APPLICANTS TABLE
-- Stores applicant identity and verification metadata
-- =============================================================================
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_verified_at TIMESTAMP WITH TIME ZONE,
  verification_count INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX idx_applicants_email ON applicants(email);
CREATE INDEX idx_applicants_last_verified ON applicants(last_verified_at);

-- =============================================================================
-- EMPLOYERS TABLE
-- Stores employer account information and API credentials
-- =============================================================================
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  api_key UUID DEFAULT uuid_generate_v4(),
  api_key_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ats_type VARCHAR(50), -- 'greenhouse', 'lever', etc.
  ats_api_key TEXT, -- Encrypted ATS API credentials
  ats_webhook_secret TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'per_verification', -- 'per_verification', 'growth', 'enterprise'
  verification_quota INTEGER, -- NULL for per-verification, number for subscription tiers
  verifications_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Index for API key lookups
CREATE INDEX idx_employers_api_key ON employers(api_key);
CREATE INDEX idx_employers_email ON employers(email);

-- =============================================================================
-- PROOFS TABLE
-- Stores encrypted ZK proofs with expiration and metadata
-- =============================================================================
CREATE TABLE proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  proof_data TEXT NOT NULL, -- Encrypted ZK proof (AES-256)
  proof_hash VARCHAR(255) UNIQUE NOT NULL, -- SHA-256 hash for duplicate detection
  proof_type VARCHAR(50) NOT NULL, -- 'us_passport', 'state_id', 'ssn_address', etc.
  data_source VARCHAR(100), -- 'zkpass', 'stripe_identity', etc.
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Default 90 days from verified_at
  device_fingerprint TEXT, -- For fraud detection
  ip_address INET,
  user_agent TEXT,
  blockchain_tx_hash VARCHAR(255), -- Optional: for on-chain proof registry
  blockchain_network VARCHAR(50), -- 'polygon', 'zksync', etc.
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_reason TEXT,
  metadata JSONB, -- Additional flexible data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_proofs_applicant_id ON proofs(applicant_id);
CREATE INDEX idx_proofs_expires_at ON proofs(expires_at);
CREATE INDEX idx_proofs_proof_hash ON proofs(proof_hash);
CREATE INDEX idx_proofs_verified_at ON proofs(verified_at);

-- =============================================================================
-- VERIFICATIONS TABLE
-- Audit log of all verification attempts and results
-- =============================================================================
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES applicants(id) ON DELETE SET NULL,
  employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,
  proof_id UUID REFERENCES proofs(id) ON DELETE SET NULL,
  job_id VARCHAR(255), -- External job ID from ATS
  job_title VARCHAR(255),
  ats_candidate_id VARCHAR(255), -- ID from Greenhouse/Lever
  verified BOOLEAN NOT NULL,
  is_reused_proof BOOLEAN DEFAULT FALSE, -- Whether proof was reused from previous verification
  verification_method VARCHAR(50), -- 'widget', 'webhook', 'api', etc.
  failure_reason TEXT, -- If verified=false, why?
  ip_address INET,
  user_agent TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- Additional context (e.g., custom fields)
);

-- Indexes for analytics and lookups
CREATE INDEX idx_verifications_applicant_id ON verifications(applicant_id);
CREATE INDEX idx_verifications_employer_id ON verifications(employer_id);
CREATE INDEX idx_verifications_verified_at ON verifications(verified_at);
CREATE INDEX idx_verifications_job_id ON verifications(job_id);
CREATE INDEX idx_verifications_verified ON verifications(verified);

-- =============================================================================
-- FRAUD_ALERTS TABLE
-- Tracks suspicious activity and fraud detection events
-- =============================================================================
CREATE TABLE fraud_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES applicants(id) ON DELETE SET NULL,
  proof_id UUID REFERENCES proofs(id) ON DELETE SET NULL,
  alert_type VARCHAR(50) NOT NULL, -- 'duplicate_proof', 'suspicious_device', 'rapid_reuse', etc.
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES employers(id),
  resolution_notes TEXT,
  metadata JSONB, -- Additional fraud detection data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for unresolved alerts
CREATE INDEX idx_fraud_alerts_unresolved ON fraud_alerts(is_resolved, created_at);
CREATE INDEX idx_fraud_alerts_applicant_id ON fraud_alerts(applicant_id);

-- =============================================================================
-- WEBHOOK_EVENTS TABLE
-- Logs all incoming webhook events from ATS providers
-- =============================================================================
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- 'candidate.created', 'candidate.updated', etc.
  source VARCHAR(50) NOT NULL, -- 'greenhouse', 'lever', etc.
  payload JSONB NOT NULL, -- Full webhook payload
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for processing queue
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed, created_at);
CREATE INDEX idx_webhook_events_employer_id ON webhook_events(employer_id);

-- =============================================================================
-- AUDIT_LOGS TABLE
-- General audit trail for security and compliance
-- =============================================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Can reference applicants or employers
  user_type VARCHAR(20), -- 'applicant', 'employer', 'system'
  action VARCHAR(100) NOT NULL, -- 'login', 'api_call', 'proof_generated', etc.
  resource_type VARCHAR(50), -- 'proof', 'verification', 'employer', etc.
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20), -- 'success', 'failure'
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- =============================================================================
-- TRIGGERS
-- Automated timestamp updates and data integrity
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applicants_updated_at
  BEFORE UPDATE ON applicants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON employers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set proof expiration (90 days default)
CREATE OR REPLACE FUNCTION set_proof_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at = NEW.verified_at + INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_proof_expiration_trigger
  BEFORE INSERT ON proofs
  FOR EACH ROW
  EXECUTE FUNCTION set_proof_expiration();

-- Update applicant verification count and timestamp
CREATE OR REPLACE FUNCTION update_applicant_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verified = TRUE THEN
    UPDATE applicants
    SET
      verification_count = verification_count + 1,
      last_verified_at = NEW.verified_at
    WHERE id = NEW.applicant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applicant_verification_trigger
  AFTER INSERT ON verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_applicant_verification();

-- =============================================================================
-- VIEWS
-- Commonly used queries for analytics
-- =============================================================================

-- Active proofs (not expired, not revoked)
CREATE VIEW active_proofs AS
SELECT
  p.*,
  a.email,
  a.first_name,
  a.last_name
FROM proofs p
JOIN applicants a ON p.applicant_id = a.id
WHERE
  p.expires_at > NOW()
  AND p.is_revoked = FALSE;

-- Verification statistics per employer
CREATE VIEW employer_verification_stats AS
SELECT
  e.id AS employer_id,
  e.company_name,
  COUNT(v.id) AS total_verifications,
  COUNT(CASE WHEN v.verified = TRUE THEN 1 END) AS successful_verifications,
  COUNT(CASE WHEN v.verified = FALSE THEN 1 END) AS failed_verifications,
  COUNT(CASE WHEN v.is_reused_proof = TRUE THEN 1 END) AS reused_proofs,
  MIN(v.verified_at) AS first_verification,
  MAX(v.verified_at) AS last_verification
FROM employers e
LEFT JOIN verifications v ON e.id = v.employer_id
GROUP BY e.id, e.company_name;

-- Fraud statistics
CREATE VIEW fraud_summary AS
SELECT
  DATE(created_at) AS date,
  alert_type,
  severity,
  COUNT(*) AS alert_count,
  COUNT(CASE WHEN is_resolved = TRUE THEN 1 END) AS resolved_count
FROM fraud_alerts
GROUP BY DATE(created_at), alert_type, severity
ORDER BY date DESC, alert_count DESC;

-- =============================================================================
-- FUNCTIONS
-- Utility functions for common operations
-- =============================================================================

-- Get active proof for applicant
CREATE OR REPLACE FUNCTION get_active_proof(applicant_email VARCHAR)
RETURNS TABLE (
  proof_id UUID,
  proof_type VARCHAR,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_expired BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.proof_type,
    p.verified_at,
    p.expires_at,
    (p.expires_at < NOW()) AS is_expired
  FROM proofs p
  JOIN applicants a ON p.applicant_id = a.id
  WHERE
    a.email = applicant_email
    AND p.is_revoked = FALSE
  ORDER BY p.verified_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Check if proof is duplicate
CREATE OR REPLACE FUNCTION is_duplicate_proof(hash VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM proofs WHERE proof_hash = hash
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- INITIAL DATA
-- Seed data for development/testing
-- =============================================================================

-- Insert test employer (password: 'test123' - bcrypt hash)
INSERT INTO employers (company_name, email, password_hash, subscription_tier)
VALUES (
  'Test Recruitment Agency',
  'admin@test-agency.com',
  '$2b$10$rBV2Ifbkj5gGHzWlKR4cOeX8sWXQJZTvXQbCXz1l7qJKfCKGxj4Km',
  'growth'
);

-- Grant appropriate permissions (adjust for your deployment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO verifyus_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO verifyus_app;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE applicants IS 'Applicants who have completed or attempted verification';
COMMENT ON TABLE employers IS 'Companies/agencies using the verification service';
COMMENT ON TABLE proofs IS 'Encrypted ZK proofs with expiration and metadata';
COMMENT ON TABLE verifications IS 'Audit log of all verification attempts';
COMMENT ON TABLE fraud_alerts IS 'Suspicious activity and fraud detection events';
COMMENT ON TABLE webhook_events IS 'Incoming webhook events from ATS providers';
COMMENT ON TABLE audit_logs IS 'General security and compliance audit trail';

COMMENT ON COLUMN proofs.proof_data IS 'AES-256 encrypted ZK proof data';
COMMENT ON COLUMN proofs.proof_hash IS 'SHA-256 hash for duplicate detection';
COMMENT ON COLUMN proofs.expires_at IS 'Proof expiration timestamp (default 90 days)';
COMMENT ON COLUMN verifications.is_reused_proof IS 'Whether proof was reused from previous verification';
