-- ============================================
-- FIX: Drop existing indexes before re-running migration
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_email_verifications_token;
DROP INDEX IF EXISTS idx_email_verifications_user_id;
DROP INDEX IF EXISTS idx_email_verifications_expires_at;
DROP INDEX IF EXISTS idx_email_resend_attempts_email;
DROP INDEX IF EXISTS idx_email_resend_attempts_ip;

-- Now you can re-run migration 20250121000004_create_email_verification_tables.sql
-- Or the indexes will be created automatically with IF NOT EXISTS
