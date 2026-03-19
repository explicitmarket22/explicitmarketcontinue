# Earnings Persistence Test Plan

## Issue Fixed
Earnings, losses, and trading activity now persist across device switches via Supabase synchronization.

## What Was Changed
Two new sync effects added to `/src/lib/store.tsx`:

1. **Bot Earnings Sync** (lines 767-787)
   - Syncs `total_earned` and `total_lost` to Supabase every 30 seconds
   - Only syncs when bot is ACTIVE and has non-zero earnings/losses

2. **Signal Earnings Sync** (lines 890-910)
   - Syncs `earnings` and `total_earnings_realized` to Supabase every 30 seconds
   - Only syncs when signal is ACTIVE and has non-zero earnings/losses

3. **Copy Trade Sync** (already implemented)
   - Syncs `profit` to Supabase when copy trade is closed
   - No changes needed - already working correctly

## Test Procedure

### Device A Setup
1. Log in to the app
2. Open browser Developer Console (F12 → Console tab)
3. Create or select a **Bot** with money allocated
4. Watch console for: ✅ `earnings: $X.XX` messages appearing
5. Wait 30 seconds
6. Check console for sync confirmation (should see Supabase update messages)
7. Also create/select a **Signal** subscription
8. Wait 30 seconds and verify signal earnings also syncing

### Device B Verification
1. Open an **incognito/private browsing window** (simulates different browser/device)
2. Log in with the **same account**
3. Go to **History** page
4. Verify:
   - The Bot you created on Device A is shown with its earnings (NOT $0.00)
   - The Signal you created on Device A is shown with its earnings (NOT $0.00)
   - Amounts match what you saw on Device A
5. Check **Dashboard**
   - Bot earnings summary shows non-zero value
   - Signal earnings summary shows non-zero value
   - Copy Trading earnings shows correctly

### Expected Results
- ✅ History page shows actual P&L (not +0.00)
- ✅ Earnings persist when switching devices
- ✅ Losses show as negative values
- ✅ Dashboard totals update correctly

## Debugging

If earnings still show as $0.00:

1. **Check Supabase Tables**
   - Open Supabase dashboard
   - Go to `purchased_bots` table → Filter by your user_id
   - Check if `total_earned` and `total_lost` fields are being updated
   - Go to `purchased_signals` table → Check `earnings` field

2. **Check Browser Console**
   - Look for any red error messages (❌ Error syncing...)
   - Check if sync confirmation messages appear every 30 seconds
   - Verify no permission denied errors

3. **Check App Console (History page)**
   - Click items in History to see details
   - Verify earnings calculation formula:
     - Bot: `totalEarned - totalLost`
     - Signal: `earnings` value
     - Copy Trade: `profit` value

## Notes
- Build verified: ✅ 2074 modules compiled successfully
- No TypeScript errors
- Sync frequency: 30 seconds (configurable if needed)
- Only syncs when bot/signal is ACTIVE (closed items won't continuously sync)

## Next Steps After Testing
If everything works:
1. Test with multiple devices
2. Test with new bots/signals created on Device B (should sync back to Device A)
3. Monitor performance (sync frequency may need adjustment)
4. Consider enabling sync for closed items if they need updating

If issues persist:
1. Check that user is properly authenticated
2. Verify Supabase RLS policies allow updates
3. Check network requests in DevTools → Network tab
4. Enable verbose logging (add console.log before each sync update)
