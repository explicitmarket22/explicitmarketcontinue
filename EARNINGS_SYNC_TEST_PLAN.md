# Bot Earnings Sync Test Plan

## Overview
Testing the refactored bot earnings sync system that separates:
- **Earnings Calculation**: Every 3 seconds (local state only)
- **Database Sync**: Every 10 seconds (Supabase persistence)

## Test Environment
- Dev Server: http://localhost:5000/
- Browser Console: Open DevTools (F12 → Console tab)
- Supabase: Check dashboard for real-time updates

## Test Scenarios

### Scenario 1: Basic Earning Accumulation
**Objective**: Verify earnings increment every 3 seconds in local state

**Steps**:
1. Open http://localhost:5000/ in browser
2. Create new account or login
3. Open DevTools Console (F12)
4. Go to Bot marketplace and purchase a bot
   - Click "Buy Bot"
   - Enter payment amount (e.g., $100)
   - Complete payment
5. Wait 5-10 seconds for bot to be allocated
6. Navigate to Admin → edit bot to ACTIVATE it
7. Return to Dashboard/History page
8. **Observe Console**: Should see logs every 3 seconds:
   ```
   📊 Dashboard Updated:
      Bot Earnings: $X.XX
      Active Bots: 1
      - Bot Name: $Y.YY
   ```

**Expected Result**: 
- Earnings increment by small amount every 3 seconds
- Pattern: accumulate → wait 3s → accumulate again

### Scenario 2: Database Sync Interval
**Objective**: Verify earnings sync to Supabase every 10 seconds

**Steps**:
1. Continue from Scenario 1 (bot actively earning)
2. Watch console for sync logs (should appear every ~10 seconds):
   ```
   ✅ Synced BotName: Earned $X.XX
   ```
3. Verify sync logs show ONLY active bots for current user
4. Check that sync logs run every ~10 seconds (not too frequent)

**Expected Result**:
- Sync logs appear approximately every 10 seconds
- Earnings value in log increases from previous sync
- Only active bots are logged

### Scenario 3: Dashboard Display Accuracy
**Objective**: Verify dashboard shows real-time earnings

**Steps**:
1. Navigate to Dashboard page
2. Watch the earnings display
3. Opening DevTools, observe in Console tab:
   - Dashboard logs fire when earnings update
   - Total earnings match displayed amount
   - Individual bot earnings accumulate

**Expected Result**:
- Dashboard earnings update every 3 seconds
- Numbers are consistent between console logs and UI
- No negative values or NaN

### Scenario 4: History Page Accuracy
**Objective**: Verify history shows correct earnings

**Steps**:
1. Navigate to History page
2. Find the active bot purchase
3. Check displayed earnings amount
4. Console should show conversion logs:
   ```
   Converting bot [...properties...]
   ```
5. Verify earnings in history match dashboard

**Expected Result**:
- History shows bot purchase record
- Earnings amount is positive (not null or 0)
- History earnings match dashboard earnings

### Scenario 5: Page Refresh Persistence
**Objective**: Verify earnings persist from database

**Steps**:
1. Let bot earn for 30 seconds (multiple sync cycles)
2. Note earnings displayed
3. Refresh page (F5)
4. Wait for data to load
5. Check that earnings ≈ same as before refresh
   - May have small increase from 3-second calculation during load time

**Expected Result**:
- Earnings persist after refresh
- No loss of accumulated earnings
- Bot status remains ACTIVE

### Scenario 6: Multiple Device Sync
**Objective**: Verify real-time cross-device earnings updates

**Steps**:
1. Open app in TWO browser windows (or different browsers)
2. Login with same user account in both
3. Activate bot in Window 1
4. Watch Window 2 for real-time updates via subscriptions
5. Check console logs in both windows

**Expected Result**:
- Bot appears in both windows
- Earnings increment in both windows
- Both windows show approximately same earnings value
- Updates appear within 1-2 seconds of each other

## Debug Logging Reference

### Store.tsx Logs
- Bot purchase UUID handling
- Earnings calculation every 3s
- Sync operation every 10s
- Subscription updates

### Dashboard.tsx Logs
```
📊 Dashboard Updated:
   Bot Earnings: $123.45
   Active Bots: 2
   - Bot Alpha: $50.12
   - Bot Beta: $73.33
```

### History.tsx Logs
```
Converting bot: {id, name, earned, status...}
```

## Success Criteria

| Criterion | Status |
|-----------|--------|
| Earnings increment every 3 seconds | ⬜ |
| Sync logs appear every 10 seconds | ⬜ |
| Dashboard displays updating earnings | ⬜ |
| History shows accurate earnings | ⬜ |
| Page refresh persists earnings | ⬜ |
| Cross-device sync responsive | ⬜ |

## Troubleshooting

### Issue: No earnings increment
- **Check**: Is bot status 'ACTIVE'?
- **Check**: Does bot have allocatedAmount > 0?
- **Check**: Is performance/dailyReturn value > 0?
- **Console**: Look for any errors in earnings calculation
- **Action**: Check bot record in Supabase user_bots table

### Issue: No sync logs appearing
- **Check**: Is bot status 'ACTIVE'?
- **Check**: Are there Supabase update errors?
- **Console**: Look for "❌ Error syncing" messages
- **Action**: Check Supabase RLS policies on user_bots table

### Issue: Earnings not persisting on refresh
- **Check**: Did sync complete before refresh?
- **Action**: Wait 11 seconds before refreshing (after sync)
- **Check**: Verify total_earned value in Supabase

### Issue: History shows different earnings than dashboard
- **Check**: Are we showing the same bot?
- **Check**: History conversion logic
- **Action**: Check console logs for data mismatch

## Notes
- Earnings calculation is probabilistic (70% chance per interval unless outcome is specified)
- Sync interval is 10 seconds to reduce database load
- Calculation interval is 3 seconds for smooth UI updates
