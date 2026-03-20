-- Fix user_bots table schema - add missing columns for bot activation

-- Check if user_bots table exists, if not create it with all required columns
-- If it exists, add missing columns

-- Add missing columns to user_bots table
ALTER TABLE user_bots
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS duration_value TEXT DEFAULT '7',
ADD COLUMN IF NOT EXISTS duration_type TEXT DEFAULT 'days',
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS outcome TEXT DEFAULT 'win',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Ensure user_balances table exists with correct structure
CREATE TABLE IF NOT EXISTS user_balances (
  user_id UUID PRIMARY KEY NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) DEFAULT 4000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_bots_user_id ON user_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bots_status ON user_bots(status);
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);

-- Update existing records to have valid end_date if they're ACTIVE and don't have one
UPDATE user_bots
SET 
  end_date = NOW() + INTERVAL '30 days',
  started_at = created_at,
  duration_value = '30',
  duration_type = 'days',
  outcome = 'win',
  updated_at = NOW()
WHERE status = 'ACTIVE' AND end_date IS NULL;

-- Verify the schema
\dt user_bots
\dt user_balances
