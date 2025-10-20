-- ============================================
-- CREATE BETTER AUTH COMPATIBLE TABLES
-- ============================================
-- Better Auth expects: user, session, account, verification
-- We already have: users, user_sessions, oauth_accounts, verifications
-- This migration creates views or aliases for compatibility
-- Created: 2024-12-20
-- Story: STORY-015

-- ============================================
-- Option 1: Create Views (recommended)
-- ============================================
-- This allows Better Auth to work with existing schema

-- Create view for 'user' pointing to 'users'
CREATE OR REPLACE VIEW "user" AS SELECT * FROM users;

-- Create view for 'session' pointing to 'user_sessions'  
CREATE OR REPLACE VIEW "session" AS SELECT * FROM user_sessions;

-- Create view for 'account' pointing to 'oauth_accounts'
CREATE OR REPLACE VIEW "account" AS SELECT * FROM oauth_accounts;

-- Note: 'verifications' table already exists with correct name

-- ============================================
-- Enable INSERT/UPDATE/DELETE on views
-- ============================================
-- Make views updatable by creating rules

-- User view rules
CREATE OR REPLACE RULE user_insert AS ON INSERT TO "user"
DO INSTEAD INSERT INTO users VALUES (NEW.*) RETURNING *;

CREATE OR REPLACE RULE user_update AS ON UPDATE TO "user"
DO INSTEAD UPDATE users SET 
  email = NEW.email,
  email_verified = NEW.email_verified,
  email_verified_at = NEW.email_verified_at,
  password_hash = NEW.password_hash,
  name = NEW.name,
  avatar = NEW.avatar,
  phone = NEW.phone,
  updated_at = NOW()
WHERE id = OLD.id
RETURNING *;

CREATE OR REPLACE RULE user_delete AS ON DELETE TO "user"
DO INSTEAD DELETE FROM users WHERE id = OLD.id RETURNING *;

-- Session view rules
CREATE OR REPLACE RULE session_insert AS ON INSERT TO "session"
DO INSTEAD INSERT INTO user_sessions VALUES (NEW.*) RETURNING *;

CREATE OR REPLACE RULE session_update AS ON UPDATE TO "session"
DO INSTEAD UPDATE user_sessions SET
  token = NEW.token,
  expires_at = NEW.expires_at,
  last_activity_at = NEW.last_activity_at
WHERE id = OLD.id
RETURNING *;

CREATE OR REPLACE RULE session_delete AS ON DELETE TO "session"
DO INSTEAD DELETE FROM user_sessions WHERE id = OLD.id RETURNING *;

-- Account view rules
CREATE OR REPLACE RULE account_insert AS ON INSERT TO "account"
DO INSTEAD INSERT INTO oauth_accounts VALUES (NEW.*) RETURNING *;

CREATE OR REPLACE RULE account_update AS ON UPDATE TO "account"
DO INSTEAD UPDATE oauth_accounts SET
  access_token = NEW.access_token,
  refresh_token = NEW.refresh_token,
  expires_at = NEW.expires_at,
  updated_at = NOW()
WHERE id = OLD.id
RETURNING *;

CREATE OR REPLACE RULE account_delete AS ON DELETE TO "account"
DO INSTEAD DELETE FROM oauth_accounts WHERE id = OLD.id RETURNING *;

-- ============================================
-- Comments
-- ============================================
COMMENT ON VIEW "user" IS 'Better Auth compatibility view for users table';
COMMENT ON VIEW "session" IS 'Better Auth compatibility view for user_sessions table';
COMMENT ON VIEW "account" IS 'Better Auth compatibility view for oauth_accounts table';
