-- Fix RLS policies for user_signals table

-- Enable RLS (should already be enabled)
ALTER TABLE user_signals ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "users_view_own_signals" ON user_signals;
DROP POLICY IF EXISTS "users_insert_own_signals" ON user_signals;
DROP POLICY IF EXISTS "users_update_own_signals" ON user_signals;
DROP POLICY IF EXISTS "admin_manage_all_signals" ON user_signals;

-- Policy: Users can view their own signals
CREATE POLICY "users_view_own_signals" ON user_signals
  FOR SELECT USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
    OR (SELECT is_admin FROM user_profiles WHERE auth_id = auth.uid()) = TRUE
  );

-- Policy: Users can insert their own signals
CREATE POLICY "users_insert_own_signals" ON user_signals
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
  );

-- Policy: Users can update their own signals, admin can update all
CREATE POLICY "users_update_own_signals" ON user_signals
  FOR UPDATE USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
    OR (SELECT is_admin FROM user_profiles WHERE auth_id = auth.uid()) = TRUE
  );

-- Policy: Admin can delete signals
CREATE POLICY "admin_delete_signals" ON user_signals
  FOR DELETE USING (
    (SELECT is_admin FROM user_profiles WHERE auth_id = auth.uid()) = TRUE
  );
