# Bot History Sync Fix Guide

## The Issue
Bots purchased are not showing in the History page.

## Root Causes to Check

### 1. **Supabase Table Missing**
The `user_bots` table may not exist in your Supabase database.

**Fix:** Run this in your Supabase SQL Editor:

```sql
-- Create user_bots table
CREATE TABLE IF NOT EXISTS user_bots (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bot_user ON user_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_status ON user_bots(status);
```

### 2. **Check Browser Console**
1. Open DevTools (F12)
2. Go to Console tab
3. Check for these logs when you purchase a bot:
   - `✅ Bot purchase request sent. Awaiting admin approval.`
   - `✅ Error saving bot to Supabase:` (means table doesn't exist)

### 3. **Test Bot Purchase**
1. Login with any user
2. Go to Bot page
3. Click "Subscribe Now" on any bot
4. Complete payment
5. Go to History page
6. Check Console for debug logs

### 4. **Debug Info Visible in Console**
After navigating to History, you should see:
```
📊 History Page Loaded - Debug Info:
   User: [Your Name]
   Purchased Bots: [Count]
   Bot Details: [Array of bots]
```

## If Still Not Working

1. **Check user_bots table exists**: Run this query in Supabase
   ```sql
   SELECT * FROM user_bots LIMIT 1;
   ```

2. **Verify data was saved**: After purchasing a bot, check:
   ```sql
   SELECT * FROM user_bots WHERE user_id = 'YOUR_USER_ID';
   ```

3. **Check RLS Policies**: Make sure user can read their own bots
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_bots';
   ```

## Expected Behavior

✅ After purchase: Bot appears in "My Purchased Bots" section
✅ On History page: Bot appears in history list
✅ On Dashboard: Bot earnings display

## Need More Help?

Check the console logs for exact error messages and share them!
