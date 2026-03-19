-- Migration: Create tables for purchased bots, signals, and copy trades
-- Run this in the Supabase SQL Editor to set up the required tables

-- Create purchased_bots table
CREATE TABLE IF NOT EXISTS public.purchased_bots (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  allocated_amount DECIMAL(15, 2) DEFAULT 0,
  total_earned DECIMAL(15, 2) DEFAULT 0,
  total_lost DECIMAL(15, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  performance DECIMAL(5, 2),
  daily_return DECIMAL(5, 2),
  duration_value TEXT,
  duration_type TEXT,
  max_duration_ms BIGINT,
  end_date TIMESTAMP WITH TIME ZONE,
  outcome TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create purchased_signals table
CREATE TABLE IF NOT EXISTS public.purchased_signals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  allocation DECIMAL(15, 2) DEFAULT 0,
  cost DECIMAL(15, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  win_rate DECIMAL(5, 2) DEFAULT 0,
  trades_followed INT DEFAULT 0,
  earnings DECIMAL(15, 2) DEFAULT 0,
  total_earnings_realized DECIMAL(15, 2) DEFAULT 0,
  duration_value TEXT,
  duration_type TEXT,
  end_date TIMESTAMP WITH TIME ZONE,
  outcome TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  active_trades JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create purchased_copy_trades table
CREATE TABLE IF NOT EXISTS public.purchased_copy_trades (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trades_id BIGINT NOT NULL,
  trader_name TEXT NOT NULL,
  allocation DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  copied_trades INT DEFAULT 0,
  profit DECIMAL(15, 2) DEFAULT 0,
  duration_value TEXT NOT NULL,
  duration_type TEXT NOT NULL,
  win_rate TEXT DEFAULT '0%',
  risk TEXT DEFAULT 'Medium',
  performance DECIMAL(5, 2),
  trader_return DECIMAL(5, 2) DEFAULT 0,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_purchased_bots_user_id ON public.purchased_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_purchased_bots_status ON public.purchased_bots(status);
CREATE INDEX IF NOT EXISTS idx_purchased_signals_user_id ON public.purchased_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_purchased_signals_status ON public.purchased_signals(status);
CREATE INDEX IF NOT EXISTS idx_purchased_copy_trades_user_id ON public.purchased_copy_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_purchased_copy_trades_status ON public.purchased_copy_trades(status);

-- Add RLS policies for security (if RLS is enabled)
-- These ensure users can only see their own records

-- Purchased Bots Policies
ALTER TABLE public.purchased_bots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchased bots" ON public.purchased_bots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchased bots" ON public.purchased_bots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchased bots" ON public.purchased_bots
  FOR UPDATE USING (auth.uid() = user_id);

-- Purchased Signals Policies
ALTER TABLE public.purchased_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchased signals" ON public.purchased_signals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchased signals" ON public.purchased_signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchased signals" ON public.purchased_signals
  FOR UPDATE USING (auth.uid() = user_id);

-- Purchased Copy Trades Policies
ALTER TABLE public.purchased_copy_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own copy trades" ON public.purchased_copy_trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own copy trades" ON public.purchased_copy_trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own copy trades" ON public.purchased_copy_trades
  FOR UPDATE USING (auth.uid() = user_id);
