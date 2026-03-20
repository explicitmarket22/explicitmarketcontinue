-- Minimal schema for bot persistence and history
-- Run these statements one by one in Supabase SQL Editor

-- 1. Add missing recent_trades table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS recent_trades (
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

CREATE INDEX IF NOT EXISTS idx_recent_trades_user ON recent_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_trades_status ON recent_trades(status);
