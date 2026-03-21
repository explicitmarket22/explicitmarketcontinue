-- ============================================================================
-- COMPLETE SIGNAL PURCHASE → APPROVAL → ALLOCATION → ACTIVATION FLOW FIX
-- ============================================================================
-- Copy this entire file and run in Supabase SQL Editor

-- Step 1: Drop existing table to start fresh
DROP TABLE IF EXISTS user_signals CASCADE;

-- Step 2: Create complete user_signals table with ALL required fields
CREATE TABLE user_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  signal_id VARCHAR NOT NULL,
  provider_name VARCHAR NOT NULL,
  
  -- Status flow: PENDING_APPROVAL → APPROVED_FOR_ALLOCATION → ACTIVE → CLOSED/PAUSED
  status VARCHAR DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED_FOR_ALLOCATION', 'ACTIVE', 'PAUSED', 'CLOSED')),
  
  -- Capital management
  allocation NUMERIC(18,2) DEFAULT 0 NOT NULL,
  cost NUMERIC(18,2) NOT NULL,
  earnings NUMERIC(18,2) DEFAULT 0 NOT NULL,
  total_earnings_realized NUMERIC(18,2) DEFAULT 0 NOT NULL,
  
  -- Signal configuration
  win_rate NUMERIC(5,2),
  trades_followed INTEGER DEFAULT 0,
  active_trades JSONB DEFAULT '[]',
  outcome VARCHAR CHECK (outcome IN ('win', 'lose', 'random')),
  
  -- Duration configuration
  duration_value VARCHAR DEFAULT '7',
  duration_type VARCHAR DEFAULT 'days' CHECK (duration_type IN ('minutes', 'hours', 'days')),
  max_duration_ms BIGINT,
  
  -- Timestamps for activation and tracking
  subscribed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  approved_at TIMESTAMP,
  started_at TIMESTAMP,
  end_date TIMESTAMP,
  
  -- Audit trail
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Step 3: Create critical indexes for performance
CREATE INDEX idx_user_signals_user_id ON user_signals(user_id);
CREATE INDEX idx_user_signals_status ON user_signals(status);
CREATE INDEX idx_user_signals_user_status ON user_signals(user_id, status);
CREATE INDEX idx_user_signals_updated ON user_signals(updated_at);

-- Step 4: Create signal_approvals table for admin tracking
CREATE TABLE IF NOT EXISTS signal_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL UNIQUE REFERENCES user_signals(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_type VARCHAR NOT NULL CHECK (approval_type IN ('PURCHASE', 'ACTIVATION')),
  status VARCHAR DEFAULT 'APPROVED' CHECK (status IN ('APPROVED', 'REJECTED')),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_signal_approvals_signal ON signal_approvals(signal_id);
CREATE INDEX idx_signal_approvals_admin ON signal_approvals(admin_id);

-- Step 5: Create signal_earning_history for tracking
CREATE TABLE IF NOT EXISTS signal_earning_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES user_signals(id) ON DELETE CASCADE,
  total_earned NUMERIC(18,2) NOT NULL,
  total_realized NUMERIC(18,2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_signal_earning_history_signal ON signal_earning_history(signal_id);
CREATE INDEX idx_signal_earning_history_time ON signal_earning_history(recorded_at);

-- Step 6: Enable RLS on user_signals
ALTER TABLE user_signals ENABLE ROW LEVEL SECURITY;

-- Step 7: RLS Policy - Users can only see their own signals
DROP POLICY IF EXISTS "Users can view own signals" ON user_signals;
CREATE POLICY "Users can view own signals" ON user_signals
  FOR SELECT USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
    OR (SELECT is_admin FROM user_profiles WHERE auth_id = auth.uid()) = TRUE
  );

-- Step 8: RLS Policy - Users can only insert their own signals
DROP POLICY IF EXISTS "Users can create own signals" ON user_signals;
CREATE POLICY "Users can create own signals" ON user_signals
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
  );

-- Step 9: RLS Policy - Users can only update their own signals, admin can update all
DROP POLICY IF EXISTS "Users can update own signals" ON user_signals;
CREATE POLICY "Users can update own signals" ON user_signals
  FOR UPDATE USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
    OR (SELECT is_admin FROM user_profiles WHERE auth_id = auth.uid()) = TRUE
  );

-- Step 10: Create admin view for approvals dashboard
CREATE OR REPLACE VIEW admin_pending_signals AS
SELECT 
  us.id,
  us.user_id,
  up.email as user_email,
  up.full_name as user_name,
  us.provider_name,
  us.cost,
  us.status,
  us.allocation,
  us.subscribed_at,
  us.created_at
FROM user_signals us
LEFT JOIN user_profiles up ON us.user_id = up.id
WHERE us.status IN ('PENDING_APPROVAL', 'APPROVED_FOR_ALLOCATION')
ORDER BY us.created_at ASC;

-- Step 11: Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_signals_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_signals_update_timestamp ON user_signals;
CREATE TRIGGER user_signals_update_timestamp
BEFORE UPDATE ON user_signals
FOR EACH ROW
EXECUTE FUNCTION update_user_signals_timestamp();

-- Step 12: Verify schema
SELECT 'user_signals table created successfully' as status,
       COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'user_signals';
