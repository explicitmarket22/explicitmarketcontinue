-- =============================================================================
-- COMPREHENSIVE SUPABASE SCHEMA FOR TRADING PLATFORM
-- Coverage: Dashboard, User Management, Balance Control, Page Access, Approvals,
-- KYC, Funded Accounts, Transactions, Wallets, Deposits, Credit Card, Bots,
-- Signals, Copy Trading, Manual Creation - COMPLETE A-Z FUNCTIONALITY
-- =============================================================================

-- =============================================================================
-- 1. CORE USER & AUTHENTICATION TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE, -- Link to Supabase auth.users
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  phone_number VARCHAR,
  country VARCHAR,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  trade_mode VARCHAR DEFAULT 'NORMAL', -- NORMAL, PROFIT, LOSS
  kyc_status VARCHAR DEFAULT 'NOT_SUBMITTED', -- NOT_SUBMITTED, PENDING, APPROVED, REJECTED
  locked_pages TEXT[], -- Array of page names (Dashboard, TradePage, Bot, etc)
  account_created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 2. BALANCE & ACCOUNT TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance NUMERIC(18,2) DEFAULT 10000.00, -- Starting balance for new accounts
  equity NUMERIC(18,2) DEFAULT 0.00,
  margin NUMERIC(18,2) DEFAULT 0.00,
  free_margin NUMERIC(18,2) DEFAULT 0.00,
  margin_level NUMERIC(10,2) DEFAULT 0.00,
  leverage INTEGER DEFAULT 100,
  account_type VARCHAR DEFAULT 'LIVE', -- LIVE, DEMO
  currency VARCHAR DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_number VARCHAR UNIQUE,
  account_type VARCHAR, -- TRADING, FUNDED, COPY
  status VARCHAR DEFAULT 'ACTIVE', -- ACTIVE, FROZEN, CLOSED
  total_deposits NUMERIC(18,2) DEFAULT 0,
  total_withdrawals NUMERIC(18,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 3. TRANSACTION MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_type VARCHAR NOT NULL, -- DEPOSIT, WITHDRAWAL, BOT_PURCHASE, SIGNAL_PURCHASE, 
                                      -- COPY_TRADE_PURCHASE, FUNDED_ACCOUNT_PURCHASE
  amount NUMERIC(18,2) NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  method VARCHAR, -- bank_transfer, credit_card, crypto, admin, wallet
  payment_processor VARCHAR, -- stripe, paypal, coinbase, etc
  status VARCHAR DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, REJECTED, CANCELLED
  description TEXT,
  metadata JSONB, -- Store any additional data
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES user_profiles(id),
  approval_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  reason TEXT,
  reviewed_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 4. WALLET & BANKING
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_name VARCHAR,
  wallet_address VARCHAR,
  cryptocurrency VARCHAR NOT NULL, -- BTC, ETH, USDT, etc
  balance NUMERIC(18,8) DEFAULT 0,
  status VARCHAR DEFAULT 'ACTIVE', -- ACTIVE, FROZEN, CLOSED
  is_deposit_wallet BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_holder_name VARCHAR NOT NULL,
  account_number VARCHAR NOT NULL,
  bank_name VARCHAR NOT NULL,
  bank_code VARCHAR,
  routing_number VARCHAR,
  swift_code VARCHAR,
  country VARCHAR,
  currency VARCHAR DEFAULT 'USD',
  status VARCHAR DEFAULT 'ACTIVE', -- ACTIVE, FROZEN, CLOSED
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_deposit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency VARCHAR NOT NULL UNIQUE, -- BTC, ETH, EUR, USD at system level
  cryptocurrency VARCHAR,
  deposit_address VARCHAR UNIQUE,
  bank_account_number VARCHAR,
  bank_name VARCHAR,
  swift_code VARCHAR,
  routing_number VARCHAR,
  qr_code_url VARCHAR,
  status VARCHAR DEFAULT 'ACTIVE', -- ACTIVE, MAINTENANCE, CLOSED
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 5. CREDIT CARD & DEPOSIT PROCESSING
-- =============================================================================

CREATE TABLE IF NOT EXISTS credit_card_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(18,2) NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  card_last_4 VARCHAR(4),
  card_brand VARCHAR, -- VISA, MASTERCARD, AMEX
  cardholder_name VARCHAR,
  processor VARCHAR NOT NULL, -- stripe, paypal, adyen, square
  processor_transaction_id VARCHAR,
  status VARCHAR DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
  failure_reason TEXT,
  fee_amount NUMERIC(18,2) DEFAULT 0,
  net_amount NUMERIC(18,2),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  webhook_received_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor VARCHAR NOT NULL,
  event_type VARCHAR,
  transaction_id UUID REFERENCES credit_card_deposits(id),
  payload JSONB,
  status VARCHAR DEFAULT 'PENDING', -- PENDING, PROCESSED, FAILED
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- =============================================================================
-- 6. BOT MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS bot_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_name VARCHAR NOT NULL,
  description TEXT,
  performance_percentage NUMERIC(5,2), -- E.g., 64 for 64% win rate
  daily_return NUMERIC(5,2),
  price NUMERIC(18,2),
  features TEXT[],
  status VARCHAR DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, DISCONTINUED
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  bot_template_id UUID NOT NULL REFERENCES bot_templates(id),
  bot_name VARCHAR NOT NULL,
  purchase_price NUMERIC(18,2) NOT NULL,
  allocated_amount NUMERIC(18,2) DEFAULT 0.00,
  total_earned NUMERIC(18,2) DEFAULT 0.00,
  total_lost NUMERIC(18,2) DEFAULT 0.00,
  performance NUMERIC(5,2),
  status VARCHAR DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, ACTIVE, PAUSED, CLOSED, TERMINATED
  outcome VARCHAR DEFAULT 'random', -- win, lose, random
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  duration_value INTEGER,
  duration_type VARCHAR, -- minutes, hours, days
  purchased_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_purchase_id UUID NOT NULL UNIQUE REFERENCES bot_purchases(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  approval_reason TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_purchase_id UUID NOT NULL REFERENCES bot_purchases(id) ON DELETE CASCADE,
  action VARCHAR, -- STARTED, TRADE_EXECUTED, TRADE_CLOSED, PAUSED, RESUMED, TERMINATED
  details JSONB,
  profit_loss NUMERIC(18,2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 7. SIGNAL MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS signal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR NOT NULL,
  provider_email VARCHAR,
  description TEXT,
  win_rate NUMERIC(5,2), -- Percentage
  average_monthly_return NUMERIC(5,2),
  subscription_price NUMERIC(18,2),
  status VARCHAR DEFAULT 'ACTIVE',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signal_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  signal_template_id UUID NOT NULL REFERENCES signal_templates(id),
  provider_name VARCHAR NOT NULL,
  subscription_cost NUMERIC(18,2) NOT NULL,
  allocation NUMERIC(18,2) DEFAULT 0.00,
  earnings NUMERIC(18,2) DEFAULT 0.00,
  trades_followed INTEGER DEFAULT 0,
  win_rate NUMERIC(5,2),
  status VARCHAR DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED_FOR_ALLOCATION, ACTIVE, PAUSED, CLOSED, TERMINATED
  outcome VARCHAR DEFAULT 'random', -- win, lose, random
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  duration_value INTEGER,
  duration_type VARCHAR, -- days, weeks, months
  subscribed_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signal_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_subscription_id UUID NOT NULL UNIQUE REFERENCES signal_subscriptions(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  approval_reason TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signal_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_subscription_id UUID NOT NULL REFERENCES signal_subscriptions(id) ON DELETE CASCADE,
  symbol VARCHAR,
  trade_type VARCHAR, -- BUY, SELL
  entry_price NUMERIC(20,8),
  stop_loss NUMERIC(20,8),
  take_profit NUMERIC(20,8),
  current_earnings NUMERIC(18,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 8. COPY TRADING
-- =============================================================================

CREATE TABLE IF NOT EXISTS copy_trade_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_name VARCHAR NOT NULL,
  trader_description TEXT,
  total_monthly_return NUMERIC(5,2),
  win_rate NUMERIC(5,2),
  average_trade_duration VARCHAR,
  is_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR DEFAULT 'ACTIVE',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS copy_trade_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  copy_trade_template_id UUID NOT NULL REFERENCES copy_trade_templates(id),
  trader_name VARCHAR NOT NULL,
  allocation NUMERIC(18,2) NOT NULL,
  trader_return NUMERIC(5,2), -- Expected trader return percentage
  profit NUMERIC(18,2) DEFAULT 0.00,
  status VARCHAR DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, ACTIVE, PAUSED, CLOSED
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  duration_value INTEGER,
  duration_type VARCHAR, -- minutes, hours, days, weeks
  purchased_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS copy_trade_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_trade_id UUID NOT NULL UNIQUE REFERENCES copy_trade_contracts(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 9. FUNDED ACCOUNTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS funded_account_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_size NUMERIC(18,2),
  profit_split VARCHAR, -- E.g., "70:30" for 70% trader, 30% company
  duration_days INTEGER,
  daily_drawdown_limit NUMERIC(5,2),
  monthly_drawdown_limit NUMERIC(5,2),
  profit_target NUMERIC(18,2),
  price NUMERIC(18,2),
  description TEXT,
  status VARCHAR DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funded_account_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  funded_account_template_id UUID NOT NULL REFERENCES funded_account_templates(id),
  account_size NUMERIC(18,2) NOT NULL,
  purchase_price NUMERIC(18,2) NOT NULL,
  profit_split VARCHAR,
  status VARCHAR DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, ACTIVE, FAILED, CLOSED
  performance NUMERIC(5,2) DEFAULT 0,
  current_balance NUMERIC(18,2),
  trades_executed INTEGER DEFAULT 0,
  days_remaining INTEGER,
  daily_drawdown_used NUMERIC(5,2) DEFAULT 0,
  monthly_drawdown_used NUMERIC(5,2) DEFAULT 0,
  purchased_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funded_account_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funded_account_id UUID NOT NULL UNIQUE REFERENCES funded_account_purchases(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  rejection_reason TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 10. KYC VERIFICATION
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
  status VARCHAR DEFAULT 'NOT_SUBMITTED', -- NOT_SUBMITTED, PENDING, APPROVED, REJECTED
  rejection_reason TEXT,
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_verification_id UUID NOT NULL REFERENCES kyc_verifications(id) ON DELETE CASCADE,
  document_type VARCHAR, -- FRONT, BACK, SELFIE
  document_url VARCHAR,
  document_name VARCHAR,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 11. PAGE ACCESS & LOCKING
-- =============================================================================

CREATE TABLE IF NOT EXISTS page_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  page_name VARCHAR NOT NULL, -- Dashboard, TradePage, Bot, Signals, CopyTrading, etc
  is_locked BOOLEAN DEFAULT FALSE,
  locked_reason TEXT,
  locked_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  page_name VARCHAR,
  access_time TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR,
  user_agent VARCHAR,
  status VARCHAR -- GRANTED, DENIED
);

-- =============================================================================
-- 12. ADMIN AUDIT & LOGGING
-- =============================================================================

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  action_type VARCHAR NOT NULL, -- BALANCE_ADJUSTMENT, PAGE_LOCK, APPROVE_BOT, APPROVE_KYC, etc
  target_user_id UUID REFERENCES user_profiles(id),
  action_details JSONB,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  ip_address VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR, -- BOT_ACTIVATED, SIGNAL_ALLOCATED, TRADE_EXECUTED, ERROR, etc
  severity VARCHAR DEFAULT 'INFO', -- INFO, WARNING, ERROR, CRITICAL
  description TEXT,
  related_entity_type VARCHAR, -- USER, BOT, SIGNAL, TRANSACTION
  related_entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 13. MARKET DATA & SIGNALS
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
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR NOT NULL,
  signal_type VARCHAR, -- BUY, SELL
  entry_price NUMERIC(20,8),
  stop_loss NUMERIC(20,8),
  take_profit NUMERIC(20,8),
  confidence_percentage NUMERIC(5,2),
  signal_time TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 14. DASHBOARD & REPORTING VIEWS
-- =============================================================================

CREATE OR REPLACE VIEW dashboard_user_summary AS
SELECT
  up.id,
  up.email,
  up.full_name,
  up.is_verified,
  up.trade_mode,
  up.kyc_status,
  ub.balance,
  ub.equity,
  COUNT(DISTINCT bp.id) as active_bots,
  COUNT(DISTINCT ss.id) as active_signals,
  COUNT(DISTINCT ctc.id) as active_copy_trades,
  COUNT(DISTINCT fap.id) as active_funded_accounts,
  up.account_created_at,
  up.last_login
FROM user_profiles up
LEFT JOIN user_balances ub ON up.id = ub.user_id
LEFT JOIN bot_purchases bp ON up.id = bp.user_id AND bp.status = 'ACTIVE'
LEFT JOIN signal_subscriptions ss ON up.id = ss.user_id AND ss.status = 'ACTIVE'
LEFT JOIN copy_trade_contracts ctc ON up.id = ctc.user_id AND ctc.status = 'ACTIVE'
LEFT JOIN funded_account_purchases fap ON up.id = fap.user_id AND fap.status = 'ACTIVE'
GROUP BY up.id, ub.balance, ub.equity;

CREATE OR REPLACE VIEW dashboard_transactions_summary AS
SELECT
  DATE_TRUNC('day', t.created_at) as date,
  t.transaction_type,
  COUNT(*) as count,
  SUM(t.amount) as total_amount,
  COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) as completed,
  COUNT(CASE WHEN t.status = 'PENDING' THEN 1 END) as pending,
  COUNT(CASE WHEN t.status = 'REJECTED' THEN 1 END) as rejected
FROM transactions t
GROUP BY DATE_TRUNC('day', t.created_at), t.transaction_type
ORDER BY date DESC;

CREATE OR REPLACE VIEW dashboard_approvals_pending AS
SELECT
  'bot' as approval_type,
  ba.id,
  bp.user_id,
  ba.admin_id,
  up.full_name as user_name,
  bp.bot_name as item_name,
  bp.purchase_price as amount,
  ba.created_at
FROM bot_approvals ba
LEFT JOIN bot_purchases bp ON ba.bot_purchase_id = bp.id
LEFT JOIN user_profiles up ON bp.user_id = up.id
WHERE ba.approval_status = 'PENDING'

UNION ALL

SELECT
  'signal' as approval_type,
  sa.id,
  ss.user_id,
  sa.admin_id,
  up.full_name as user_name,
  ss.provider_name as item_name,
  ss.subscription_cost as amount,
  sa.created_at
FROM signal_approvals sa
LEFT JOIN signal_subscriptions ss ON sa.signal_subscription_id = ss.id
LEFT JOIN user_profiles up ON ss.user_id = up.id
WHERE sa.approval_status = 'PENDING'

UNION ALL

SELECT
  'funded_account' as approval_type,
  faa.id,
  fap.user_id,
  faa.admin_id,
  up.full_name as user_name,
  CONCAT('Funded Account - $', fap.account_size) as item_name,
  fap.purchase_price as amount,
  faa.created_at
FROM funded_account_approvals faa
LEFT JOIN funded_account_purchases fap ON faa.funded_account_id = fap.id
LEFT JOIN user_profiles up ON fap.user_id = up.id
WHERE faa.approval_status = 'PENDING';

-- =============================================================================
-- 15. ADMIN FUNCTIONS - BALANCE CONTROL
-- =============================================================================

CREATE OR REPLACE FUNCTION admin_add_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS TABLE(success BOOLEAN, message TEXT, new_balance NUMERIC) AS $$
BEGIN
  -- Add balance to user
  UPDATE user_balances
  SET balance = balance + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO transactions (user_id, transaction_type, amount, method, status, created_at)
  VALUES (p_user_id, 'DEPOSIT', p_amount, 'admin', 'COMPLETED', NOW());

  -- Record admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'BALANCE_ADJUSTMENT', p_user_id, jsonb_build_object('type', 'ADD', 'amount', p_amount), 'Admin deposit', NOW());

  RETURN QUERY
  SELECT true, CONCAT('Added $', p_amount, ' to user balance'), (SELECT balance FROM user_balances WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_remove_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS TABLE(success BOOLEAN, message TEXT, new_balance NUMERIC) AS $$
BEGIN
  -- Remove balance from user
  UPDATE user_balances
  SET balance = GREATEST(0, balance - p_amount), updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO transactions (user_id, transaction_type, amount, method, status, created_at)
  VALUES (p_user_id, 'WITHDRAWAL', p_amount, 'admin', 'COMPLETED', NOW());

  -- Record admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'BALANCE_ADJUSTMENT', p_user_id, jsonb_build_object('type', 'REMOVE', 'amount', p_amount), 'Admin withdrawal', NOW());

  RETURN QUERY
  SELECT true, CONCAT('Removed $', p_amount, ' from user balance'), (SELECT balance FROM user_balances WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 16. ADMIN FUNCTIONS - USER MANAGEMENT
-- =============================================================================

CREATE OR REPLACE FUNCTION admin_toggle_page_lock(p_user_id UUID, p_page_name VARCHAR)
RETURNS TABLE(success BOOLEAN, message TEXT, is_now_locked BOOLEAN) AS $$
DECLARE
  v_is_locked BOOLEAN;
BEGIN
  -- Check current lock status
  v_is_locked := p_page_name = ANY((SELECT locked_pages FROM user_profiles WHERE id = p_user_id));

  IF v_is_locked THEN
    -- Unlock the page
    UPDATE user_profiles
    SET locked_pages = array_remove(locked_pages, p_page_name), updated_at = NOW()
    WHERE id = p_user_id;
  ELSE
    -- Lock the page
    UPDATE user_profiles
    SET locked_pages = array_append(COALESCE(locked_pages, ARRAY[]::text[]), p_page_name), updated_at = NOW()
    WHERE id = p_user_id;
  END IF;

  -- Record admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'PAGE_LOCK_TOGGLE', p_user_id, jsonb_build_object('page', p_page_name, 'action', CASE WHEN v_is_locked THEN 'UNLOCKED' ELSE 'LOCKED' END), 'Admin page lock control', NOW());

  RETURN QUERY
  SELECT true, CASE WHEN NOT v_is_locked THEN 'Page locked' ELSE 'Page unlocked' END, NOT v_is_locked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_toggle_user_lock(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT, is_now_locked BOOLEAN) AS $$
DECLARE
  v_was_verified BOOLEAN;
BEGIN
  -- Get current verification status
  SELECT is_verified INTO v_was_verified FROM user_profiles WHERE id = p_user_id;

  -- Toggle verification status
  UPDATE user_profiles
  SET is_verified = NOT is_verified, updated_at = NOW()
  WHERE id = p_user_id;

  -- Record admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'USER_LOCK_TOGGLE', p_user_id, jsonb_build_object('action', CASE WHEN NOT v_was_verified THEN 'LOCKED' ELSE 'UNLOCKED' END), 'Admin user lock control', NOW());

  RETURN QUERY
  SELECT true, CASE WHEN v_was_verified THEN 'User locked' ELSE 'User unlocked' END, v_was_verified;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_set_trade_mode(p_user_id UUID, p_mode VARCHAR)
RETURNS TABLE(success BOOLEAN, message TEXT, new_mode VARCHAR) AS $$
BEGIN
  -- Validate mode
  IF p_mode NOT IN ('NORMAL', 'PROFIT', 'LOSS') THEN
    RETURN QUERY SELECT false, 'Invalid trade mode', NULL;
    RETURN;
  END IF;

  -- Update trade mode
  UPDATE user_profiles
  SET trade_mode = p_mode, updated_at = NOW()
  WHERE id = p_user_id;

  -- Record admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'TRADE_MODE_CHANGE', p_user_id, jsonb_build_object('mode', p_mode), 'Admin trade mode control', NOW());

  RETURN QUERY
  SELECT true, CONCAT('Trade mode set to ', p_mode), p_mode;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 17. ADMIN FUNCTIONS - APPROVALS
-- =============================================================================

CREATE OR REPLACE FUNCTION admin_approve_bot_purchase(p_bot_purchase_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  -- Update bot status to APPROVED
  UPDATE bot_purchases
  SET status = 'APPROVED'
  WHERE id = p_bot_purchase_id;

  -- Update approval record
  INSERT INTO bot_approvals (bot_purchase_id, admin_id, approval_status, reviewed_at)
  VALUES (p_bot_purchase_id, AUTH.uid(), 'APPROVED', NOW())
  ON CONFLICT (bot_purchase_id) DO UPDATE
  SET approval_status = 'APPROVED', reviewed_at = NOW();

  -- Record admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'BOT_APPROVAL', (SELECT user_id FROM bot_purchases WHERE id = p_bot_purchase_id), 
          jsonb_build_object('bot_id', p_bot_purchase_id), 'Approved bot purchase', NOW());

  RETURN QUERY SELECT true, 'Bot purchase approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_reject_bot_purchase(p_bot_purchase_id UUID, p_reason VARCHAR DEFAULT NULL)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  -- Update bot status
  UPDATE bot_purchases
  SET status = 'REJECTED'
  WHERE id = p_bot_purchase_id;

  -- Update approval record
  INSERT INTO bot_approvals (bot_purchase_id, admin_id, approval_status, approval_reason, reviewed_at)
  VALUES (p_bot_purchase_id, AUTH.uid(), 'REJECTED', p_reason, NOW())
  ON CONFLICT (bot_purchase_id) DO UPDATE
  SET approval_status = 'REJECTED', approval_reason = p_reason, reviewed_at = NOW();

  RETURN QUERY SELECT true, 'Bot purchase rejected';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_approve_signal_purchase(p_signal_subscription_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  -- Update signal status to APPROVED_FOR_ALLOCATION
  UPDATE signal_subscriptions
  SET status = 'APPROVED_FOR_ALLOCATION', approved_at = NOW()
  WHERE id = p_signal_subscription_id;

  -- Update approval record
  INSERT INTO signal_approvals (signal_subscription_id, admin_id, approval_status, reviewed_at)
  VALUES (p_signal_subscription_id, AUTH.uid(), 'APPROVED', NOW())
  ON CONFLICT (signal_subscription_id) DO UPDATE
  SET approval_status = 'APPROVED', reviewed_at = NOW();

  RETURN QUERY SELECT true, 'Signal purchase approved for capital allocation';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_reject_signal_purchase(p_signal_subscription_id UUID, p_reason VARCHAR DEFAULT NULL)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE signal_subscriptions
  SET status = 'REJECTED'
  WHERE id = p_signal_subscription_id;

  INSERT INTO signal_approvals (signal_subscription_id, admin_id, approval_status, approval_reason, reviewed_at)
  VALUES (p_signal_subscription_id, AUTH.uid(), 'REJECTED', p_reason, NOW())
  ON CONFLICT (signal_subscription_id) DO UPDATE
  SET approval_status = 'REJECTED', approval_reason = p_reason, reviewed_at = NOW();

  RETURN QUERY SELECT true, 'Signal purchase rejected';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_approve_funded_account(p_funded_account_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE funded_account_purchases
  SET status = 'APPROVED', activated_at = NOW()
  WHERE id = p_funded_account_id;

  INSERT INTO funded_account_approvals (funded_account_id, admin_id, approval_status, reviewed_at)
  VALUES (p_funded_account_id, AUTH.uid(), 'APPROVED', NOW())
  ON CONFLICT (funded_account_id) DO UPDATE
  SET approval_status = 'APPROVED', reviewed_at = NOW();

  RETURN QUERY SELECT true, 'Funded account approved and activated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_reject_funded_account(p_funded_account_id UUID, p_reason VARCHAR DEFAULT NULL)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE funded_account_purchases
  SET status = 'REJECTED'
  WHERE id = p_funded_account_id;

  INSERT INTO funded_account_approvals (funded_account_id, admin_id, approval_status, rejection_reason, reviewed_at)
  VALUES (p_funded_account_id, AUTH.uid(), 'REJECTED', p_reason, NOW())
  ON CONFLICT (funded_account_id) DO UPDATE
  SET approval_status = 'REJECTED', rejection_reason = p_reason, reviewed_at = NOW();

  RETURN QUERY SELECT true, 'Funded account rejected';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 18. ADMIN FUNCTIONS - KYC
-- =============================================================================

CREATE OR REPLACE FUNCTION admin_approve_kyc(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE kyc_verifications
  SET status = 'APPROVED', reviewed_at = NOW()
  WHERE user_id = p_user_id;

  UPDATE user_profiles
  SET kyc_status = 'APPROVED', is_verified = TRUE
  WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'KYC_APPROVAL', p_user_id, jsonb_build_object('status', 'APPROVED'), 'KYC verification approved', NOW());

  RETURN QUERY SELECT true, 'KYC verification approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_reject_kyc(p_user_id UUID, p_reason VARCHAR DEFAULT NULL)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE kyc_verifications
  SET status = 'REJECTED', rejection_reason = p_reason, reviewed_at = NOW()
  WHERE user_id = p_user_id;

  UPDATE user_profiles
  SET kyc_status = 'REJECTED'
  WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'KYC_REJECTION', p_user_id, jsonb_build_object('status', 'REJECTED', 'reason', p_reason), 'KYC verification rejected', NOW());

  RETURN QUERY SELECT true, 'KYC verification rejected';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 19. ADMIN FUNCTIONS - TRANSACTION APPROVALS
-- =============================================================================

CREATE OR REPLACE FUNCTION admin_approve_transaction(p_transaction_id UUID, p_reason VARCHAR DEFAULT NULL)
RETURNS TABLE(success BOOLEAN, message TEXT, new_balance NUMERIC) AS $$
DECLARE
  v_user_id UUID;
  v_amount NUMERIC;
  v_tx_type VARCHAR;
BEGIN
  -- Get transaction details
  SELECT user_id, amount, transaction_type INTO v_user_id, v_amount, v_tx_type 
  FROM transactions WHERE id = p_transaction_id;

  -- Update transaction status
  UPDATE transactions
  SET status = 'COMPLETED', approved_by = AUTH.uid(), approval_reason = p_reason, completed_at = NOW()
  WHERE id = p_transaction_id;

  -- If DEPOSIT, add to user balance
  IF v_tx_type = 'DEPOSIT' THEN
    UPDATE user_balances
    SET balance = balance + v_amount, updated_at = NOW()
    WHERE user_id = v_user_id;
  END IF;

  -- Record admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'TRANSACTION_APPROVAL', v_user_id, jsonb_build_object('transaction_id', p_transaction_id, 'amount', v_amount), p_reason, NOW());

  RETURN QUERY
  SELECT true, 'Transaction approved', (SELECT balance FROM user_balances WHERE user_id = v_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_reject_transaction(p_transaction_id UUID, p_reason VARCHAR DEFAULT NULL)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM transactions WHERE id = p_transaction_id;

  UPDATE transactions
  SET status = 'REJECTED', approval_reason = p_reason
  WHERE id = p_transaction_id;

  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'TRANSACTION_REJECTION', v_user_id, jsonb_build_object('transaction_id', p_transaction_id), p_reason, NOW());

  RETURN QUERY SELECT true, 'Transaction rejected';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 20. ADMIN FUNCTIONS - MANUAL CREATION
-- =============================================================================

CREATE OR REPLACE FUNCTION admin_create_manual_transaction(
  p_user_id UUID,
  p_transaction_type VARCHAR,
  p_amount NUMERIC,
  p_method VARCHAR,
  p_description VARCHAR DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, transaction_id UUID) AS $$
DECLARE
  v_tx_id UUID;
BEGIN
  -- Create transaction
  INSERT INTO transactions (user_id, transaction_type, amount, method, status, description, created_at, completed_at)
  VALUES (p_user_id, p_transaction_type, p_amount, p_method, 'COMPLETED', p_description, NOW(), NOW())
  RETURNING id INTO v_tx_id;

  -- If DEPOSIT, add to balance
  IF p_transaction_type = 'DEPOSIT' THEN
    UPDATE user_balances
    SET balance = balance + p_amount, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Record admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'MANUAL_TRANSACTION_CREATE', p_user_id, 
          jsonb_build_object('type', p_transaction_type, 'amount', p_amount, 'method', p_method), 
          'Manual transaction creation', NOW());

  RETURN QUERY SELECT true, 'Manual transaction created', v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_create_manual_bot(
  p_user_id UUID,
  p_bot_template_id UUID,
  p_allocated_amount NUMERIC,
  p_outcome VARCHAR,
  p_duration_value INTEGER,
  p_duration_type VARCHAR
)
RETURNS TABLE(success BOOLEAN, message TEXT, bot_purchase_id UUID) AS $$
DECLARE
  v_bot_id UUID;
  v_bot_name VARCHAR;
  v_performance NUMERIC;
BEGIN
  -- Get bot template details
  SELECT id, bot_name, performance_percentage INTO v_bot_id, v_bot_name, v_performance
  FROM bot_templates WHERE id = p_bot_template_id;

  -- Create bot purchase in ACTIVE state (bypassing approval)
  INSERT INTO bot_purchases (
    user_id, bot_template_id, bot_name, allocated_amount, performance, 
    status, outcome, duration_value, duration_type, start_date, end_date, activated_at, purchased_at
  )
  VALUES (
    p_user_id, p_bot_template_id, v_bot_name, p_allocated_amount, v_performance,
    'ACTIVE', p_outcome, p_duration_value, p_duration_type, NOW(), 
    NOW() + (p_duration_value || ' ' || p_duration_type)::INTERVAL, NOW(), NOW()
  )
  RETURNING id INTO v_bot_id;

  -- Deduct from user balance
  UPDATE user_balances
  SET balance = balance - p_allocated_amount, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'MANUAL_BOT_CREATE', p_user_id, 
          jsonb_build_object('bot_id', v_bot_id, 'amount', p_allocated_amount), 
          'Manual bot creation and activation', NOW());

  RETURN QUERY SELECT true, CONCAT('Manual bot created: ', v_bot_name), v_bot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_create_manual_signal(
  p_user_id UUID,
  p_signal_template_id UUID,
  p_allocation NUMERIC,
  p_outcome VARCHAR,
  p_duration_value INTEGER,
  p_duration_type VARCHAR
)
RETURNS TABLE(success BOOLEAN, message TEXT, signal_subscription_id UUID) AS $$
DECLARE
  v_signal_id UUID;
  v_provider_name VARCHAR;
  v_win_rate NUMERIC;
BEGIN
  -- Get signal template details
  SELECT id, provider_name, win_rate INTO v_signal_id, v_provider_name, v_win_rate
  FROM signal_templates WHERE id = p_signal_template_id;

  -- Create signal subscription in ACTIVE state (bypassing approval)
  INSERT INTO signal_subscriptions (
    user_id, signal_template_id, provider_name, allocation, win_rate, 
    status, outcome, duration_value, duration_type, start_date, end_date, activated_at, subscribed_at
  )
  VALUES (
    p_user_id, p_signal_template_id, v_provider_name, p_allocation, v_win_rate,
    'ACTIVE', p_outcome, p_duration_value, p_duration_type, NOW(), 
    NOW() + (p_duration_value || ' ' || p_duration_type)::INTERVAL, NOW(), NOW()
  )
  RETURNING id INTO v_signal_id;

  -- Record admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, reason, created_at)
  VALUES (AUTH.uid(), 'MANUAL_SIGNAL_CREATE', p_user_id, 
          jsonb_build_object('signal_id', v_signal_id, 'allocation', p_allocation), 
          'Manual signal creation and activation', NOW());

  RETURN QUERY SELECT true, CONCAT('Manual signal created: ', v_provider_name), v_signal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_create_manual_copy_trade(
  p_user_id UUID,
  p_copy_trade_template_id UUID,
  p_allocation NUMERIC
)
RETURNS TABLE(success BOOLEAN, message TEXT, copy_trade_id UUID) AS $$
DECLARE
  v_copy_trade_id UUID;
  v_trader_name VARCHAR;
BEGIN
  -- Get copy trade template details
  SELECT id, trader_name INTO v_copy_trade_id, v_trader_name
  FROM copy_trade_templates WHERE id = p_copy_trade_template_id;

  -- Create copy trade contract in ACTIVE state
  INSERT INTO copy_trade_contracts (
    user_id, copy_trade_template_id, trader_name, allocation, status, 
    start_date, end_date, purchased_at, activated_at
  )
  VALUES (
    p_user_id, p_copy_trade_template_id, v_trader_name, p_allocation, 'ACTIVE',
    NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()
  )
  RETURNING id INTO v_copy_trade_id;

  -- Deduct from balance
  UPDATE user_balances
  SET balance = balance - p_allocation, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT true, CONCAT('Manual copy trade created: ', v_trader_name), v_copy_trade_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_create_manual_funded_account(
  p_user_id UUID,
  p_funded_account_template_id UUID,
  p_override_cost NUMERIC DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, funded_account_id UUID) AS $$
DECLARE
  v_funded_account_id UUID;
  v_account_size NUMERIC;
  v_purchase_price NUMERIC;
BEGIN
  -- Get template details
  SELECT id, account_size, price INTO v_funded_account_id, v_account_size, v_purchase_price
  FROM funded_account_templates WHERE id = p_funded_account_template_id;

  -- Override price if specified
  IF p_override_cost IS NOT NULL THEN
    v_purchase_price := p_override_cost;
  END IF;

  -- Create funded account in APPROVED state
  INSERT INTO funded_account_purchases (
    user_id, funded_account_template_id, account_size, purchase_price, status, 
    current_balance, activated_at, purchased_at
  )
  VALUES (
    p_user_id, p_funded_account_template_id, v_account_size, v_purchase_price, 'ACTIVE',
    v_account_size, NOW(), NOW()
  )
  RETURNING id INTO v_funded_account_id;

  -- Deduct from balance
  UPDATE user_balances
  SET balance = balance - v_purchase_price, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT true, CONCAT('Manual funded account created: $', v_account_size), v_funded_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 21. WALLET & DEPOSIT FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION get_system_wallet_by_currency(p_currency VARCHAR)
RETURNS TABLE(
  wallet_id UUID,
  currency VARCHAR,
  deposit_address VARCHAR,
  bank_account_number VARCHAR,
  qr_code_url VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sdw.id,
    sdw.currency,
    sdw.deposit_address,
    sdw.bank_account_number,
    sdw.qr_code_url
  FROM system_deposit_wallets sdw
  WHERE sdw.currency = p_currency AND sdw.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_crypto_deposit(
  p_user_id UUID,
  p_txn_hash VARCHAR,
  p_amount NUMERIC,
  p_currency VARCHAR
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Create transaction record
  INSERT INTO transactions (user_id, transaction_type, amount, currency, method, status, metadata, created_at)
  VALUES (p_user_id, 'DEPOSIT', p_amount, p_currency, 'crypto', 'PROCESSING', 
          jsonb_build_object('txn_hash', p_txn_hash), NOW())
  RETURNING id INTO v_transaction_id;

  -- Record system event
  INSERT INTO system_events (event_type, severity, description, related_entity_type, related_entity_id, created_at)
  VALUES ('CRYPTO_DEPOSIT_RECEIVED', 'INFO', CONCAT('Crypto deposit received: ', p_amount, ' ', p_currency), 
          'USER', p_user_id, NOW());

  RETURN QUERY SELECT true, CONCAT('Crypto deposit recorded for ', p_amount, ' ', p_currency);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 22. INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_bot_purchases_user_id ON bot_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_purchases_status ON bot_purchases(status);
CREATE INDEX IF NOT EXISTS idx_signal_subscriptions_user_id ON signal_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_signal_subscriptions_status ON signal_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_copy_trade_contracts_user_id ON copy_trade_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_copy_trade_contracts_status ON copy_trade_contracts(status);
CREATE INDEX IF NOT EXISTS idx_funded_account_purchases_user_id ON funded_account_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_funded_account_purchases_status ON funded_account_purchases(status);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_page_locks_user_id ON page_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_card_deposits_user_id ON credit_card_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_deposits_status ON credit_card_deposits(status);

-- =============================================================================
-- 23. ROW-LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_trade_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE funded_account_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_deposits ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (id = AUTH.uid() OR (SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (id = AUTH.uid());

CREATE POLICY "Users can view own balance" ON user_balances FOR SELECT USING (user_id = AUTH.uid() OR (SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (user_id = AUTH.uid() OR (SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);

CREATE POLICY "Users can view own bots" ON bot_purchases FOR SELECT USING (user_id = AUTH.uid() OR (SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);

CREATE POLICY "Users can view own signals" ON signal_subscriptions FOR SELECT USING (user_id = AUTH.uid() OR (SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);

CREATE POLICY "Users can view own copy trades" ON copy_trade_contracts FOR SELECT USING (user_id = AUTH.uid() OR (SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);

CREATE POLICY "Users can view own funded accounts" ON funded_account_purchases FOR SELECT USING (user_id = AUTH.uid() OR (SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);

CREATE POLICY "Users can view own KYC" ON kyc_verifications FOR SELECT USING (user_id = AUTH.uid() OR (SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);

CREATE POLICY "Users can view own wallets" ON user_wallets FOR SELECT USING (user_id = AUTH.uid() OR (SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);

CREATE POLICY "Users can view own bank accounts" ON user_bank_accounts FOR SELECT USING (user_id = AUTH.uid() OR (SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);

-- Admin can view all admin actions
CREATE POLICY "Admins can view all admin actions" ON admin_actions FOR SELECT USING ((SELECT is_admin FROM user_profiles WHERE id = AUTH.uid()) = TRUE);

-- =============================================================================
-- 24. HELPER FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_summary(p_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  email VARCHAR,
  full_name VARCHAR,
  balance NUMERIC,
  kyc_status VARCHAR,
  is_verified BOOLEAN,
  trade_mode VARCHAR,
  active_bots INTEGER,
  active_signals INTEGER,
  active_copy_trades INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.email,
    up.full_name,
    ub.balance,
    up.kyc_status,
    up.is_verified,
    up.trade_mode,
    (SELECT COUNT(*) FROM bot_purchases WHERE user_id = p_user_id AND status = 'ACTIVE')::INTEGER,
    (SELECT COUNT(*) FROM signal_subscriptions WHERE user_id = p_user_id AND status = 'ACTIVE')::INTEGER,
    (SELECT COUNT(*) FROM copy_trade_contracts WHERE user_id = p_user_id AND status = 'ACTIVE')::INTEGER
  FROM user_profiles up
  LEFT JOIN user_balances ub ON up.id = ub.user_id
  WHERE up.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_users(p_search_term VARCHAR)
RETURNS TABLE(
  user_id UUID,
  email VARCHAR,
  full_name VARCHAR,
  is_verified BOOLEAN,
  kyc_status VARCHAR,
  balance NUMERIC,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.email,
    up.full_name,
    up.is_verified,
    up.kyc_status,
    ub.balance,
    up.account_created_at
  FROM user_profiles up
  LEFT JOIN user_balances ub ON up.id = ub.user_id
  WHERE up.email ILIKE '%' || p_search_term || '%'
     OR up.full_name ILIKE '%' || p_search_term || '%'
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE(
  total_users BIGINT,
  verified_users BIGINT,
  pending_kyc BIGINT,
  pending_approvals BIGINT,
  total_balance NUMERIC,
  total_deposits_processed NUMERIC,
  total_withdrawals_processed NUMERIC,
  active_trading_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM user_profiles)::BIGINT,
    (SELECT COUNT(*) FROM user_profiles WHERE is_verified = TRUE)::BIGINT,
    (SELECT COUNT(*) FROM kyc_verifications WHERE status = 'PENDING')::BIGINT,
    (SELECT COUNT(*) FROM bot_approvals WHERE approval_status = 'PENDING' 
       UNION ALL SELECT COUNT(*) FROM signal_approvals WHERE approval_status = 'PENDING' 
       UNION ALL SELECT COUNT(*) FROM funded_account_approvals WHERE approval_status = 'PENDING')::BIGINT,
    (SELECT COALESCE(SUM(balance), 0) FROM user_balances)::NUMERIC,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE transaction_type = 'DEPOSIT' AND status = 'COMPLETED')::NUMERIC,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE transaction_type = 'WITHDRAWAL' AND status = 'COMPLETED')::NUMERIC,
    (SELECT COUNT(*) FROM bot_purchases WHERE status = 'ACTIVE' OR (SELECT COUNT(*) FROM signal_subscriptions WHERE status = 'ACTIVE'))::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 25. TRIGGERS FOR AUTOMATION
-- =============================================================================

-- Auto-update timestamp on user_profiles
CREATE OR REPLACE FUNCTION update_user_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_timestamp();

-- Auto-update timestamp on user_balances
CREATE TRIGGER trigger_user_balances_updated_at
BEFORE UPDATE ON user_balances
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_timestamp();

-- Auto-update timestamp on transactions
CREATE TRIGGER trigger_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_timestamp();

-- Auto-update timestamp on bot_purchases
CREATE TRIGGER trigger_bot_purchases_updated_at
BEFORE UPDATE ON bot_purchases
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_timestamp();

-- Auto-update timestamp on signal_subscriptions
CREATE TRIGGER trigger_signal_subscriptions_updated_at
BEFORE UPDATE ON signal_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_timestamp();

-- Auto-update timestamp on copy_trade_contracts
CREATE TRIGGER trigger_copy_trade_contracts_updated_at
BEFORE UPDATE ON copy_trade_contracts
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_timestamp();

-- Auto-update timestamp on funded_account_purchases
CREATE TRIGGER trigger_funded_account_purchases_updated_at
BEFORE UPDATE ON funded_account_purchases
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_timestamp();

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
