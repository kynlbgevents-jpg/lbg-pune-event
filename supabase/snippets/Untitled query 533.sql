-- Kyndryl Year End Celebrations Database Schema
-- Run this in Supabase SQL Editor

-- 1. Create table
CREATE TABLE IF NOT EXISTS registrations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- PII fields: AES-256-GCM encrypted at application layer before insert
  -- Format stored: "iv:authTag:ciphertext" (all base64, colon-delimited)
  full_name_enc        TEXT NOT NULL,
  mobile_enc           TEXT NOT NULL,
  emergency_name_enc   TEXT NOT NULL,
  emergency_mobile_enc TEXT NOT NULL,
  email_enc            TEXT NOT NULL,

  -- Blind index for email lookups (duplicate detection + verification)
  -- HMAC-SHA256(email.toLowerCase(), BLIND_INDEX_SECRET)
  email_hash           TEXT NOT NULL UNIQUE,

  -- Plaintext event-specific fields
  dietary_pref         TEXT NOT NULL CHECK (dietary_pref IN ('veg', 'non_veg')),
  alcohol_pref         TEXT NOT NULL CHECK (alcohol_pref IN ('drinking', 'not_drinking')),
  travel_mode          TEXT,
  registered_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  attended             BOOLEAN NOT NULL DEFAULT false,
  entry_time           TIMESTAMPTZ
);

-- Index for speedy QR UUID lookup
CREATE INDEX IF NOT EXISTS idx_registrations_id ON registrations(id);

-- Index for blind email hash search
CREATE INDEX IF NOT EXISTS idx_registrations_email_hash ON registrations(email_hash);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies:
-- Allow anonymous users to INSERT registrations
CREATE POLICY "Allow anonymous insert"
  ON registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow service role full access (Next.js server-side API routes use service role)
CREATE POLICY "Allow service_role full access"
  ON registrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
