-- Migration: Create recent_trades table for persisting trade history
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.recent_trades (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'BUY', -- BUY or SELL
  volume DECIMAL(15, 2) DEFAULT 0,
  entry_price DECIMAL(20, 8) NOT NULL,
  close_price DECIMAL(20, 8) NOT NULL,
  profit DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'CLOSED', -- OPEN or CLOSED
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_recent_trades_user_id ON public.recent_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_trades_symbol ON public.recent_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_recent_trades_closed_at ON public.recent_trades(closed_at DESC);

-- Add RLS policies for security
ALTER TABLE public.recent_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recent trades" ON public.recent_trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recent trades" ON public.recent_trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recent trades" ON public.recent_trades
  FOR UPDATE USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE public.recent_trades IS 'Stores closed trade history for each user with entry/exit prices and profit/loss';
