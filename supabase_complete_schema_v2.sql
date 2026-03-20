-- =============================================================================
-- COMPREHENSIVE SUPABASE SCHEMA - COMPLETE PLATFORM (v2)
-- ALL FEATURES: Users, Referrals, Balance Control, Approvals, KYC, 
-- Trading, Bots, Signals, Copy Trading, Funded Accounts, Wallets, Admin
-- PASSWORD: Stored in plain text (NOT HASHED) as requested
-- =============================================================================

-- =============================================================================
-- 1. CORE USER & AUTHENTICATION WITH REFERRALS
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  phone_number VARCHAR,
  country VARCHAR,
  password VARCHAR NOT NULL, -- PLAIN TEXT, NOT HASHED
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_locked BOOLEAN DEFAULT FALSE,
  trade_mode VARCHAR DEFAULT 'NORMAL', -- NORMAL, PROFIT, LOSS
  kyc_status VARCHAR DEFAULT 'NOT_SUBMITTED', -- NOT_SUBMITTED, PENDING, APPROVED, REJECTED
  locked_pages TEXT[] DEFAULT '{}', -- Array of page names
  
  -- Referral Fields
  referral_code VARCHAR UNIQUE NOT NULL, -- USER_XXXXXXXX or ADMIN_MASTER
  referred_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  referral_earnings NUMERIC(18,2) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  
  account_created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_email ON user_profiles(email);
CREATE INDEX idx_user_referral_code ON user_profiles(referral_code);
CREATE INDEX idx_user_is_admin ON user_profiles(is_admin);

-- =============================================================================
-- 2. REFERRAL MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS referral_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  referred_user_email VARCHAR NOT NULL,
  referred_user_name VARCHAR NOT NULL,
  bonus_amount NUMERIC(18,2) DEFAULT 25.00,
  status VARCHAR DEFAULT 'PENDING', -- PENDING, COMPLETED, REJECTED
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  rejected_reason TEXT
);

CREATE INDEX idx_referral_referrer ON referral_records(referrer_id);
CREATE INDEX idx_referral_referred_user ON referral_records(referred_user_id);
CREATE INDEX idx_referral_status ON referral_records(status);
CREATE INDEX idx_referral_created ON referral_records(created_at);

-- =============================================================================
-- 3. BALANCE & ACCOUNT MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance NUMERIC(18,2) DEFAULT 4000.00, -- Starting balance
  equity NUMERIC(18,2) DEFAULT 4000.00,
  margin NUMERIC(18,2) DEFAULT 0.00,
  free_margin NUMERIC(18,2) DEFAULT 4000.00,
  margin_level NUMERIC(10,2) DEFAULT 0.00,
  leverage INTEGER DEFAULT 100,
  account_type VARCHAR DEFAULT 'LIVE', -- LIVE, DEMO
  currency VARCHAR DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS balance_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  old_balance NUMERIC(18,2),
  new_balance NUMERIC(18,2),
  amount_changed NUMERIC(18,2),
  reason VARCHAR, -- DEPOSIT, WITHDRAWAL, ADMIN_ADJUSTMENT, REFERRAL_BONUS, etc
  adjusted_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_balance_user ON balance_adjustments(user_id);
CREATE INDEX idx_balance_adjusted_by ON balance_adjustments(adjusted_by);

-- =============================================================================
-- 4. TRANSACTION MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_type VARCHAR NOT NULL, -- DEPOSIT, WITHDRAWAL, REFERRAL_BONUS, BOT_PURCHASE, 
                                      -- SIGNAL_PURCHASE, COPY_TRADE_PURCHASE, FUNDED_ACCOUNT_PURCHASE
  amount NUMERIC(18,2) NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  method VARCHAR, -- bank_transfer, credit_card, crypto, admin, wallet
  status VARCHAR DEFAULT 'PENDING', -- PENDING, COMPLETED, REJECTED, CANCELLED
  description TEXT,
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES user_profiles(id),
  approval_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transaction_user ON transactions(user_id);
CREATE INDEX idx_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_transaction_status ON transactions(status);

-- =============================================================================
-- 5. WALLET & BANKING SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_label VARCHAR,
  wallet_address VARCHAR NOT NULL,
  wallet_type VARCHAR DEFAULT 'DEPOSIT', -- DEPOSIT, PURCHASE
  cryptocurrency VARCHAR NOT NULL, -- BTC, ETH, USDT, etc
  network VARCHAR, -- ERC20, TRC20, BEP20, etc
  balance NUMERIC(18,8) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_name VARCHAR NOT NULL,
  account_number VARCHAR NOT NULL,
  bank_name VARCHAR NOT NULL,
  routing_number VARCHAR,
  swift_code VARCHAR,
  iban VARCHAR,
  account_type VARCHAR, -- CHECKING, SAVINGS
  country VARCHAR,
  currency VARCHAR DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_name VARCHAR UNIQUE NOT NULL,
  crypto_id VARCHAR,
  network VARCHAR,
  wallet_address VARCHAR UNIQUE NOT NULL,
  min_deposit NUMERIC(18,8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 6. CREDIT CARD & DEPOSIT PROCESSING
-- =============================================================================

CREATE TABLE IF NOT EXISTS credit_card_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(18,2) NOT NULL,
  card_number VARCHAR, -- Last 4 digits or masked
  cardholder_name VARCHAR,
  expiry_date VARCHAR,
  cvv VARCHAR,
  status VARCHAR DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED, REJECTED
  rejection_reason TEXT,
  processor_response TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  approved_by UUID REFERENCES user_profiles(id),
  approval_notes TEXT
);

CREATE INDEX idx_cc_deposit_user ON credit_card_deposits(user_id);
CREATE INDEX idx_cc_deposit_status ON credit_card_deposits(status);

-- =============================================================================
-- 7. BOT MANAGEMENT & TRADING BOTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS bot_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(18,2),
  performance NUMERIC(5,2), -- Win rate %
  win_rate NUMERIC(5,2),
  trades_count INTEGER,
  bot_type VARCHAR,
  risk_level VARCHAR, -- Low, Medium, High
  max_drawdown NUMERIC(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  bot_template_id UUID REFERENCES bot_templates(id),
  bot_name VARCHAR NOT NULL,
  bot_type VARCHAR,
  status VARCHAR DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, ACTIVE, PAUSED, CLOSED
  allocated_amount NUMERIC(18,2) DEFAULT 0,
  total_earned NUMERIC(18,2) DEFAULT 0,
  total_lost NUMERIC(18,2) DEFAULT 0,
  performance NUMERIC(5,2),
  daily_return NUMERIC(5,2),
  outcome VARCHAR, -- win, lose
  duration_value VARCHAR,
  duration_type VARCHAR, -- minutes, hours, days
  max_duration_ms BIGINT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  purchased_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL UNIQUE REFERENCES user_bots(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  approval_reason TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bot_user ON user_bots(user_id);
CREATE INDEX idx_bot_status ON user_bots(status);

-- =============================================================================
-- 7b. RECENT TRADES HISTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS recent_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  trade_type VARCHAR NOT NULL, -- BUY, SELL, etc
  symbol VARCHAR NOT NULL,
  entry_price NUMERIC(18,8),
  current_price NUMERIC(18,8),
  quantity NUMERIC(18,8),
  profit_loss NUMERIC(18,2),
  profit_loss_percentage NUMERIC(5,2),
  status VARCHAR DEFAULT 'OPEN', -- OPEN, CLOSED
  opened_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recent_trades_user ON recent_trades(user_id);
CREATE INDEX idx_recent_trades_status ON recent_trades(status);

-- =============================================================================
-- 8. SIGNAL MANAGEMENT & SUBSCRIPTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS signal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  symbol VARCHAR,
  confidence NUMERIC(5,2),
  followers INTEGER,
  cost NUMERIC(18,2),
  win_rate NUMERIC(5,2),
  trades_count INTEGER,
  avg_return NUMERIC(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  signal_template_id UUID REFERENCES signal_templates(id),
  provider_name VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, ALLOCATED, ACTIVE, PAUSED, CLOSED
  allocation NUMERIC(18,2) DEFAULT 0,
  earnings NUMERIC(18,2) DEFAULT 0,
  win_rate NUMERIC(5,2),
  outcome VARCHAR, -- win, lose
  duration_value VARCHAR,
  duration_type VARCHAR, -- minutes, hours, days
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  total_earnings_realized NUMERIC(18,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signal_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL UNIQUE REFERENCES user_signals(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED_PURCHASE, APPROVED_ALLOCATION, REJECTED
  approval_reason TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_signal_user ON user_signals(user_id);
CREATE INDEX idx_signal_status ON user_signals(status);

-- =============================================================================
-- 9. COPY TRADING
-- =============================================================================

CREATE TABLE IF NOT EXISTS copy_trade_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  win_rate NUMERIC(5,2),
  return_percentage NUMERIC(5,2),
  followers INTEGER,
  risk_level VARCHAR, -- Low, Medium, High
  daily_return NUMERIC(5,2),
  trades_count INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_copy_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  copy_trade_template_id UUID REFERENCES copy_trade_templates(id),
  trader_name VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, ACTIVE, PAUSED, CLOSED
  allocation NUMERIC(18,2) NOT NULL,
  trader_return NUMERIC(5,2),
  profit NUMERIC(18,2) DEFAULT 0,
  risk_level VARCHAR,
  duration_value VARCHAR,
  duration_type VARCHAR, -- minutes, hours, days
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  purchased_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS copy_trade_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_trade_id UUID NOT NULL UNIQUE REFERENCES user_copy_trades(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_copy_trade_user ON user_copy_trades(user_id);
CREATE INDEX idx_copy_trade_status ON user_copy_trades(status);

-- =============================================================================
-- 10. FUNDED ACCOUNTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS funded_account_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name VARCHAR NOT NULL,
  capital NUMERIC(18,2) NOT NULL,
  price NUMERIC(18,2) NOT NULL,
  profit_target NUMERIC(18,2),
  max_drawdown NUMERIC(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_funded_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES funded_account_plans(id),
  plan_name VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, ACTIVE, FAILED, CLOSED
  capital NUMERIC(18,2),
  price NUMERIC(18,2),
  profit_target NUMERIC(18,2),
  max_drawdown NUMERIC(5,2),
  current_balance NUMERIC(18,2),
  profit_loss NUMERIC(18,2) DEFAULT 0,
  purchased_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funded_account_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funded_account_id UUID NOT NULL UNIQUE REFERENCES user_funded_accounts(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  rejection_reason TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_funded_user ON user_funded_accounts(user_id);
CREATE INDEX idx_funded_status ON user_funded_accounts(status);

-- =============================================================================
-- 11. KYC VERIFICATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  first_name VARCHAR,
  last_name VARCHAR,
  date_of_birth DATE,
  country VARCHAR,
  state VARCHAR,
  city VARCHAR,
  zip_code VARCHAR,
  address VARCHAR,
  document_type VARCHAR, -- PASSPORT, DRIVER_LICENSE, NATIONAL_ID
  document_front_name VARCHAR,
  document_back_name VARCHAR,
  selfie_name VARCHAR,
  status VARCHAR DEFAULT 'NOT_SUBMITTED', -- NOT_SUBMITTED, PENDING, APPROVED, REJECTED
  rejection_reason TEXT,
  submitted_at TIMESTAMP,
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications(status);

-- =============================================================================
-- 12. PAGE ACCESS & LOCKING
-- =============================================================================

CREATE TABLE IF NOT EXISTS page_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  page_name VARCHAR NOT NULL, -- dashboard, trade, wallet, signals, bot, copy-trading, funded-accounts, kyc, referral, admin
  is_locked BOOLEAN DEFAULT FALSE,
  locked_reason TEXT,
  locked_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_page_lock_user ON page_locks(user_id);
CREATE INDEX idx_page_lock_page ON page_locks(page_name);

CREATE TABLE IF NOT EXISTS page_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  page_name VARCHAR,
  access_granted BOOLEAN DEFAULT TRUE,
  ip_address VARCHAR,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 13. ADMIN AUDIT & LOGGING
-- =============================================================================

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  action_type VARCHAR NOT NULL, -- BALANCE_ADJUSTMENT, PAGE_LOCK, APPROVE_BOT, 
                                 -- APPROVE_KYC, APPROVE_REFERRAL, etc
  target_user_id UUID REFERENCES user_profiles(id),
  action_details JSONB,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_action_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_action_target ON admin_actions(target_user_id);
CREATE INDEX idx_admin_action_type ON admin_actions(action_type);

-- =============================================================================
-- 14. MARKET DATA
-- =============================================================================

CREATE TABLE IF NOT EXISTS market_symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  category VARCHAR, -- FOREX, CRYPTO, COMMODITY, INDEX
  bid NUMERIC(20,8),
  ask NUMERIC(20,8),
  spread NUMERIC(20,8),
  digits INTEGER,
  change NUMERIC(10,2),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_symbol ON market_symbols(symbol);

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to get referral stats for a user
CREATE OR REPLACE FUNCTION get_referral_stats(p_user_id UUID)
RETURNS TABLE (
  total_referrals BIGINT,
  total_earnings NUMERIC,
  pending_earnings NUMERIC,
  completed_earnings NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_referrals,
    COALESCE(SUM(CASE WHEN r.status = 'COMPLETED' THEN r.bonus_amount ELSE 0 END), 0) as total_earnings,
    COALESCE(SUM(CASE WHEN r.status = 'PENDING' THEN r.bonus_amount ELSE 0 END), 0) as pending_earnings,
    COALESCE(SUM(CASE WHEN r.status = 'COMPLETED' THEN r.bonus_amount ELSE 0 END), 0) as completed_earnings
  FROM referral_records r
  WHERE r.referrer_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve referral and add bonus
CREATE OR REPLACE FUNCTION approve_referral(p_referral_id UUID, p_admin_id UUID)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
DECLARE
  v_referral referral_records%ROWTYPE;
  v_referrer user_profiles%ROWTYPE;
BEGIN
  -- Get referral record
  SELECT * INTO v_referral FROM referral_records WHERE id = p_referral_id FOR UPDATE;
  
  IF v_referral IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Referral not found'::TEXT;
    RETURN;
  END IF;
  
  IF v_referral.status = 'COMPLETED' THEN
    RETURN QUERY SELECT FALSE, 'Referral already completed'::TEXT;
    RETURN;
  END IF;
  
  -- Get referrer
  SELECT * INTO v_referrer FROM user_profiles WHERE id = v_referral.referrer_id FOR UPDATE;
  
  -- Update referral status
  UPDATE referral_records 
  SET status = 'COMPLETED', completed_at = NOW()
  WHERE id = p_referral_id;
  
  -- Update user balance
  UPDATE user_balances 
  SET balance = balance + v_referral.bonus_amount,
      updated_at = NOW()
  WHERE user_id = v_referral.referrer_id;
  
  -- Update referral earnings
  UPDATE user_profiles
  SET referral_earnings = referral_earnings + v_referral.bonus_amount,
      total_referrals = total_referrals + 1,
      updated_at = NOW()
  WHERE id = v_referral.referrer_id;
  
  -- Log transaction
  INSERT INTO transactions (user_id, transaction_type, amount, method, status, description)
  VALUES (v_referral.referrer_id, 'REFERRAL_BONUS', v_referral.bonus_amount, 'admin_approval', 'COMPLETED', 
          'Referral bonus for ' || v_referral.referred_user_name);
  
  -- Log admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, new_value)
  VALUES (p_admin_id, 'APPROVE_REFERRAL', v_referral.referrer_id, 
          jsonb_build_object('referral_id', p_referral_id, 'bonus_amount', v_referral.bonus_amount),
          'COMPLETED');
  
  RETURN QUERY SELECT TRUE, 'Referral approved and bonus added'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to adjust balance
CREATE OR REPLACE FUNCTION adjust_user_balance(p_user_id UUID, p_admin_id UUID, p_amount NUMERIC, p_reason TEXT)
RETURNS TABLE (success BOOLEAN, new_balance NUMERIC, message TEXT) AS $$
DECLARE
  v_old_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT balance INTO v_old_balance FROM user_balances WHERE user_id = p_user_id FOR UPDATE;
  
  IF v_old_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, 'User balance not found'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_old_balance + p_amount;
  
  IF v_new_balance < 0 THEN
    RETURN QUERY SELECT FALSE, v_old_balance, 'Insufficient balance'::TEXT;
    RETURN;
  END IF;
  
  -- Update balance
  UPDATE user_balances 
  SET balance = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log adjustment
  INSERT INTO balance_adjustments (user_id, old_balance, new_balance, amount_changed, reason, adjusted_by)
  VALUES (p_user_id, v_old_balance, v_new_balance, p_amount, p_reason, p_admin_id);
  
  -- Log transaction
  INSERT INTO transactions (user_id, transaction_type, amount, method, status, description)
  VALUES (p_user_id, 'ADMIN_ADJUSTMENT', ABS(p_amount), 'admin', 'COMPLETED', p_reason);
  
  -- Log admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, old_value, new_value, reason)
  VALUES (p_admin_id, 'BALANCE_ADJUSTMENT', p_user_id, v_old_balance::TEXT, v_new_balance::TEXT, p_reason);
  
  RETURN QUERY SELECT TRUE, v_new_balance, 'Balance adjusted successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to get user transactions
CREATE OR REPLACE FUNCTION get_user_transactions(p_user_id UUID, p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  transaction_type VARCHAR,
  amount NUMERIC,
  status VARCHAR,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.transaction_type, t.amount, t.status, t.created_at
  FROM transactions t
  WHERE t.user_id = p_user_id
  ORDER BY t.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to lock/unlock user pages
CREATE OR REPLACE FUNCTION toggle_page_lock(p_user_id UUID, p_admin_id UUID, p_page_name VARCHAR, p_lock BOOLEAN)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
  INSERT INTO page_locks (user_id, page_name, is_locked, locked_by)
  VALUES (p_user_id, p_page_name, p_lock, p_admin_id)
  ON CONFLICT (user_id, page_name) DO UPDATE
  SET is_locked = p_lock, locked_by = p_admin_id, updated_at = NOW();
  
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, new_value)
  VALUES (p_admin_id, 'PAGE_LOCK', p_user_id, 
          jsonb_build_object('page', p_page_name, 'locked', p_lock),
          CASE WHEN p_lock THEN 'LOCKED' ELSE 'UNLOCKED' END);
  
  RETURN QUERY SELECT TRUE, CASE WHEN p_lock THEN 'Page locked' ELSE 'Page unlocked' END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to get all pending approvals (admin view)
CREATE OR REPLACE FUNCTION get_pending_approvals()
RETURNS TABLE (
  type VARCHAR,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'BOT'::VARCHAR, COUNT(*)::BIGINT FROM bot_approvals WHERE approval_status = 'PENDING'
  UNION ALL
  SELECT 'SIGNAL'::VARCHAR, COUNT(*)::BIGINT FROM signal_approvals WHERE approval_status = 'PENDING'
  UNION ALL
  SELECT 'COPY_TRADE'::VARCHAR, COUNT(*)::BIGINT FROM copy_trade_approvals WHERE approval_status = 'PENDING'
  UNION ALL
  SELECT 'FUNDED_ACCOUNT'::VARCHAR, COUNT(*)::BIGINT FROM funded_account_approvals WHERE approval_status = 'PENDING'
  UNION ALL
  SELECT 'KYC'::VARCHAR, COUNT(*)::BIGINT FROM kyc_verifications WHERE status = 'PENDING'
  UNION ALL
  SELECT 'REFERRAL'::VARCHAR, COUNT(*)::BIGINT FROM referral_records WHERE status = 'PENDING'
  UNION ALL
  SELECT 'CREDIT_CARD'::VARCHAR, COUNT(*)::BIGINT FROM credit_card_deposits WHERE status = 'PENDING';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_copy_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_funded_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_records ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own profile
CREATE POLICY "users_view_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = auth_id OR is_admin = TRUE);

-- RLS Policy: Users can only view their own balance
CREATE POLICY "users_view_own_balance" ON user_balances
  FOR SELECT USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
    OR (SELECT is_admin FROM user_profiles WHERE auth_id = auth.uid()) = TRUE
  );

-- RLS Policy: Users can only view their own transactions
CREATE POLICY "users_view_own_transactions" ON transactions
  FOR SELECT USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
    OR (SELECT is_admin FROM user_profiles WHERE auth_id = auth.uid()) = TRUE
  );

-- RLS Policy: Users can view referrals involving them
CREATE POLICY "users_view_referrals" ON referral_records
  FOR SELECT USING (
    referrer_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
    OR referred_user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
    OR (SELECT is_admin FROM user_profiles WHERE auth_id = auth.uid()) = TRUE
  );

-- =============================================================================
-- INITIAL DATA: HARDCODED ADMIN USER
-- =============================================================================

-- Insert admin user (only if email doesn't exist)
INSERT INTO user_profiles (
  email, full_name, phone_number, country, password, is_verified, is_admin, 
  is_active, referral_code
) VALUES (
  'admin@work.com', 'Admin', NULL, 'Global', 'admin', true, true, true, 'ADMIN_MASTER'
) ON CONFLICT (email) DO NOTHING;

-- Insert admin balance
INSERT INTO user_balances (user_id, balance, equity, free_margin)
SELECT id, 0, 0, 0 FROM user_profiles WHERE email = 'admin@work.com'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VIEWS FOR EASY DATA RETRIEVAL
-- =============================================================================

-- View: User Dashboard Summary
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT
  up.id,
  up.email,
  up.full_name,
  up.is_admin,
  ub.balance,
  up.total_referrals,
  up.referral_earnings,
  (SELECT COUNT(*) FROM referral_records WHERE referrer_id = up.id AND status = 'PENDING') as pending_referrals,
  (SELECT COUNT(*) FROM user_bots WHERE user_id = up.id AND status = 'ACTIVE') as active_bots,
  (SELECT COUNT(*) FROM user_signals WHERE user_id = up.id AND status = 'ACTIVE') as active_signals,
  (SELECT COUNT(*) FROM user_copy_trades WHERE user_id = up.id AND status = 'ACTIVE') as active_copy_trades,
  up.kyc_status,
  up.created_at
FROM user_profiles up
LEFT JOIN user_balances ub ON up.id = ub.user_id;

-- View: Admin Approvals Dashboard
CREATE OR REPLACE VIEW admin_approvals_dashboard AS
SELECT
  'bot' as approval_type,
  COUNT(*) as pending_count,
  (SELECT COUNT(*) FROM bot_approvals WHERE approval_status = 'APPROVED') as approved_count
FROM bot_approvals WHERE approval_status = 'PENDING'
UNION ALL
SELECT 'signal', COUNT(*), (SELECT COUNT(*) FROM signal_approvals WHERE approval_status = 'APPROVED')
FROM signal_approvals WHERE approval_status = 'PENDING'
UNION ALL
SELECT 'copy_trade', COUNT(*), (SELECT COUNT(*) FROM copy_trade_approvals WHERE approval_status = 'APPROVED')
FROM copy_trade_approvals WHERE approval_status = 'PENDING'
UNION ALL
SELECT 'funded_account', COUNT(*), (SELECT COUNT(*) FROM funded_account_approvals WHERE approval_status = 'APPROVED')
FROM funded_account_approvals WHERE approval_status = 'PENDING'
UNION ALL
SELECT 'kyc', COUNT(*), (SELECT COUNT(*) FROM kyc_verifications WHERE status = 'APPROVED')
FROM kyc_verifications WHERE status = 'PENDING'
UNION ALL
SELECT 'referral', COUNT(*), (SELECT COUNT(*) FROM referral_records WHERE status = 'COMPLETED')
FROM referral_records WHERE status = 'PENDING'
UNION ALL
SELECT 'credit_card', COUNT(*), (SELECT COUNT(*) FROM credit_card_deposits WHERE status = 'COMPLETED')
FROM credit_card_deposits WHERE status = 'PENDING';

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Trigger: Update user updated_at on profile change
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_timestamp
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

-- Trigger: Update balance timestamp
CREATE TRIGGER trigger_update_balance_timestamp
BEFORE UPDATE ON user_balances
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

-- Trigger: Auto-create balance record when user is created
CREATE OR REPLACE FUNCTION create_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_balances (user_id, balance, equity, free_margin)
  VALUES (NEW.id, 4000.00, 4000.00, 4000.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_balance
AFTER INSERT ON user_profiles
FOR EACH ROW
WHEN (NEW.is_admin = FALSE)
EXECUTE FUNCTION create_user_balance();

-- Trigger: Auto-create page locks on user creation
CREATE OR REPLACE FUNCTION create_page_locks()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO page_locks (user_id, page_name, is_locked)
  VALUES 
    (NEW.id, 'dashboard', FALSE),
    (NEW.id, 'trade', FALSE),
    (NEW.id, 'wallet', FALSE),
    (NEW.id, 'signals', FALSE),
    (NEW.id, 'bot', FALSE),
    (NEW.id, 'copy-trading', FALSE),
    (NEW.id, 'funded-accounts', FALSE),
    (NEW.id, 'kyc', FALSE),
    (NEW.id, 'referral', FALSE),
    (NEW.id, 'admin', TRUE); -- Admin page locked for non-admins
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_page_locks
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION create_page_locks();

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
