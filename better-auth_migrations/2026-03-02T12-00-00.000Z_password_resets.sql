-- Migration: Create password_resets table for secure OTP flow
CREATE TABLE IF NOT EXISTS password_resets (
    email TEXT PRIMARY KEY,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    last_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    locked_until TIMESTAMP WITH TIME ZONE
);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);
