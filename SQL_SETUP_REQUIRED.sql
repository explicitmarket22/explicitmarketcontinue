-- REQUIRED: Run these SQL statements ONE BY ONE in Supabase SQL Editor
-- Copy each statement, paste it, click "Run", and wait for success before moving to the next one

-- ============================================================================
-- 1. DROP existing user_bots table (if it exists and is incomplete)
-- ============================================================================
DROP TABLE IF EXISTS user_bots CASCADE;


-- ============================================================================
-- 2. CREATE user_bots table with ALL required columns
-- ============================================================================
CREATE TABLE user_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  bot_name VARCHAR NOT NULL,
  bot_type VARCHAR,
  status VARCHAR DEFAULT 'PENDING_APPROVAL',
  allocated_amount NUMERIC(18,2) DEFAULT 0,
  total_earned NUMERIC(18,2) DEFAULT 0,
  total_lost NUMERIC(18,2) DEFAULT 0,
  performance NUMERIC(5,2),
  daily_return NUMERIC(5,2),
  outcome VARCHAR,
  duration_value VARCHAR,
  duration_type VARCHAR,
  max_duration_ms BIGINT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  purchased_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- ============================================================================
-- 3. CREATE indexes for performance
-- ============================================================================
CREATE INDEX idx_bot_user ON user_bots(user_id);
CREATE INDEX idx_bot_status ON user_bots(status);


-- ============================================================================
-- 4. CREATE recent_trades table
-- ============================================================================
DROP TABLE IF EXISTS recent_trades CASCADE;

CREATE TABLE recent_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  trade_type VARCHAR NOT NULL,
  symbol VARCHAR NOT NULL,
  entry_price NUMERIC(18,8),
  current_price NUMERIC(18,8),
  quantity NUMERIC(18,8),
  profit_loss NUMERIC(18,2),
  profit_loss_percentage NUMERIC(5,2),
  status VARCHAR DEFAULT 'OPEN',
  opened_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recent_trades_user ON recent_trades(user_id);
CREATE INDEX idx_recent_trades_status ON recent_trades(status);


-- ============================================================================
-- 5. CREATE bot_approvals table (for admin approvals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bot_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL UNIQUE REFERENCES user_bots(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_status VARCHAR DEFAULT 'PENDING',
  approval_reason TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
