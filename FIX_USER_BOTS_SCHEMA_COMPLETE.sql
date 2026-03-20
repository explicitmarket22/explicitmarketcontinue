-- Complete SQL migration - copy everything and run in Supabase SQL Editor

-- Step 1: Add missing columns to user_bots
ALTER TABLE user_bots
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;

ALTER TABLE user_bots
ADD COLUMN IF NOT EXISTS duration_value TEXT DEFAULT '7';

ALTER TABLE user_bots
ADD COLUMN IF NOT EXISTS duration_type TEXT DEFAULT 'days';

ALTER TABLE user_bots
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;

ALTER TABLE user_bots
ADD COLUMN IF NOT EXISTS outcome TEXT DEFAULT 'win';

ALTER TABLE user_bots
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Step 2: Create user_balances table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_balances (
  user_id UUID PRIMARY KEY NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) DEFAULT 4000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_user_bots_user_id ON user_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bots_status ON user_bots(status);
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);

-- Step 4: Fix existing ACTIVE bots with missing dates
UPDATE user_bots
SET 
  end_date = COALESCE(end_date, NOW() + INTERVAL '30 days'),
  started_at = COALESCE(started_at, created_at),
  duration_value = COALESCE(duration_value, '30'),
  duration_type = COALESCE(duration_type, 'days'),
  outcome = COALESCE(outcome, 'win'),
  updated_at = NOW()
WHERE status = 'ACTIVE' AND (end_date IS NULL OR started_at IS NULL);
