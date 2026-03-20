# Bot System Fixes - Persistence, Sync & Schema

## Issues Fixed

### 1. ✅ Balance Not Persisting After Logout/Login
**Problem**: Balance was deducted on purchase but reverted after logout/login
**Root Cause**: `syncUserBalance` was updating `users` table instead of `user_balances`
**Fix**: Changed to update `user_balances` table (where balance is actually stored)
```typescript
// BEFORE (WRONG)
.from('users').update({ balance })

// AFTER (CORRECT)
.from('user_balances').upsert({ user_id: userId, balance })
```

### 2. ✅ Cross-Device Purchase Visibility Not Working
**Problem**: Bot purchases visible only on same device, not synced to other devices
**Root Cause**: No real-time database subscriptions
**Fix**: Added real-time subscriptions for `user_bots` changes
- Subscribes to INSERT/UPDATE events on user_bots table
- Updates local state immediately when changes occur on Supabase
- Works across devices automatically

### 3. ⚠️ Allocation Fails with 400 Error (NEEDS SQL MIGRATION)
**Problem**: "Could not find the 'started_at' column of 'user_bots' in the schema cache"
**Root Cause**: Missing columns in `user_bots` table
**Missing Columns**:
- `started_at` - when bot activation started
- `duration_value` - duration value (e.g., "7")
- `duration_type` - duration type (e.g., "days")
- `end_date` - when bot will expire
- `outcome` - win/lose outcome
- `updated_at` - timestamp

## Code Changes

### File: `/workspaces/explicitmarket/src/lib/store.tsx`

**Change 1: Fix syncUserBalance function**
- Now updates `user_balances` table (correct location)
- Uses UPSERT to create if doesn't exist
- Persistent across logout/login

**Change 2: Add Real-Time Subscriptions**
- New useEffect subscribes to user_bots table changes
- Triggers on INSERT and UPDATE events
- Automatically updates local state for cross-device sync
- Unsubscribes on logout

**Change 3: Remove max_duration_ms field**
- Removed from bot activation update (column doesn't exist)
- Fields now only include what Supabase expects

## REQUIRED ACTION: Run SQL Migration

You MUST run the SQL migration to add missing columns:

**File**: `FIX_USER_BOTS_SCHEMA.sql`

### Steps to Apply:
1. Go to Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy content from `FIX_USER_BOTS_SCHEMA.sql`
5. Run the query

### What the SQL Does:
- Adds missing columns to `user_bots` table
- Creates `user_balances` table if not exists
- Creates indexes for performance
- Sets default values for existing bots

### SQL Commands:
```sql
-- Add missing columns to user_bots
ALTER TABLE user_bots
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS duration_value TEXT DEFAULT '7',
ADD COLUMN IF NOT EXISTS duration_type TEXT DEFAULT 'days',
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS outcome TEXT DEFAULT 'win',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Ensure user_balances table exists
CREATE TABLE IF NOT EXISTS user_balances (
  user_id UUID PRIMARY KEY NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) DEFAULT 4000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_bots_user_id ON user_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bots_status ON user_bots(status);
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
```

## Expected Behavior After Fixes

### 1. Balance Persistence
1. Purchase bot for $100
2. Balance deducted: $400 → $300 ✅
3. Logout completely
4. Login again
5. ✅ Balance shows $300 (PERSISTED)
6. ✅ Not: $400 (reverted/lost)

### 2. Cross-Device Purchase Visibility
1. Purchase bot on Device A
2. Open app on Device B (same user)
3. ✅ Bot purchase appears in "My Purchased Bots" section automatically
4. ✅ Not: Need to refresh page manually
5. ✅ Real-time synced (<1 second)

### 3. Bot Allocation Works
1. Bot shows in Admin approval section
2. Admin allocates capital ($100)
3. ✅ Allocation saves without 400 error
4. ✅ Ready for next step (activation)

### 4. Bot Activation Works  
1. After allocation, admin activates bot
2. Sets duration (e.g., 30 days)
3. Sets outcome (win/lose)
4. ✅ Activation succeeds (no 400 error)
5. ✅ Bot shows ACTIVE status

## Testing After SQL Migration

### Test 1: Balance Persistence (2 min)
- [ ] Purchase bot (watch balance deduct)
- [ ] Logout fully
- [ ] Login again
- [ ] ✅ Balance is persisted (not reverted)

### Test 2: Cross-Device Sync (3 min)
- [ ] Open app in Device A and Device B (same user)
- [ ] Purchase bot on Device A
- [ ] Check Device B (no refresh)
- [ ] ✅ Bot appears automatically within 1 second

### Test 3: Bot Allocation (2 min)
- [ ] Go to Admin page
- [ ] Find bot in "Bots Ready for Allocation"
- [ ] Enter allocation amount
- [ ] Click allocate
- [ ] ✅ No 400 error
- [ ] ✅ Shows "Allocated successfully"

### Test 4: Bot Activation (2 min)
- [ ] In Admin, find bot with allocation
- [ ] Set duration and outcome
- [ ] Click activate
- [ ] ✅ No 400 error about started_at
- [ ] ✅ Bot shows ACTIVE

## Troubleshooting

### Still getting "Could not find 'started_at' column" error
**Fix**: You haven't run the SQL migration yet
- Go to Supabase SQL Editor
- Run FIX_USER_BOTS_SCHEMA.sql
- Refresh app

### Balance still reverts after logout
**Fix**: 
- Check Supabase has `user_balances` table
- Check it has `balance` column
- Run SQL migration to ensure table exists
- Clear browser cache (Ctrl+Shift+Del)

### Cross-device purchases not syncing
**Fix**:
- Requires Supabase real-time subscriptions enabled
- Check browser console (F12) for subscription errors
- Verify tables have row-level security rules that allow reads
- Ensure both devices use same user account

## Architecture Overview

### Balance Storage Flow
```
User purchases bot
    ↓
Balance deducted locally
    ↓
syncUserBalance() called
    ↓
Updates user_balances table in Supabase
    ↓
On next login → Load from user_balances table ✅ PERSISTED
```

### Cross-Device Sync Flow
```
Device A: Purchase bot
    ↓
Insert to user_bots table in Supabase
    ↓
Real-time subscription notifies Device B
    ↓
Device B: local state updates automatically
    ↓
Device B: Bot appears in UI <1 second ✅
```

### Bot Lifecycle
```
1. User purchases → status: PENDING_APPROVAL
   ↓
2. Admin approves → status: APPROVED_FOR_ALLOCATION
   ↓
3. User allocates capital → allocatedAmount > 0
   ↓
4. Admin activates → status: ACTIVE
   (Now needed: started_at, duration_value, duration_type, end_date, outcome columns)
   ↓
5. Bot earns every 3 seconds → totalEarned increases
   ↓
6. Earnings sync to Supabase every 10 seconds
   ↓
7. Bot duration expires or manually closed → status: CLOSED
```

## Files Modified

- `src/lib/store.tsx`:
  - Line ~2050: Fixed `syncUserBalance` to update `user_balances`
  - New useEffect: Added real-time subscriptions for `user_bots`
  - Line ~2350: Removed `max_duration_ms` field from activation update

- `FIX_USER_BOTS_SCHEMA.sql` (NEW):
  - SQL migration to add missing columns
  - Create user_balances table if needed
  - Create performance indexes

## Performance Improvements

- Real-time subscriptions instead of polling
- Indexed queries on user_id and status
- UPSERT for balance updates (faster, no race conditions)
- Column additions won't break existing records (IF NOT EXISTS)

## Next Steps

1. ✅ App code changes applied (balance sync + real-time subscriptions)
2. ⚠️  **RUN SQL MIGRATION** (in Supabase SQL Editor):
   - Open FIX_USER_BOTS_SCHEMA.sql
   - Copy content
   - Go to Supabase → SQL Editor → New Query
   - Paste and Run
3. ✅ Test scenarios above

**DO NOT skip step 2** - without the SQL migration, allocation will continue failing!
