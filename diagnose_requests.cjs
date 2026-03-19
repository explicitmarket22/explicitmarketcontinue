const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseRequestStorage() {
  console.log('=== DIAGNOSTIC: Request Storage Test ===\n');

  try {
    // Check 1: Look for all PENDING transactions (should include withdrawals)
    console.log('1️⃣  CHECKING PENDING TRANSACTIONS:');
    console.log('-'.repeat(60));
    
    const { data: pendingTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    console.log(`Found ${pendingTx?.length || 0} PENDING transactions:`);
    pendingTx?.forEach(t => {
      console.log(`  - ${t.transaction_type}: $${t.amount} (User: ${t.user_id.substring(0, 8)}...)`);
    });

    // Check 2: Look for all PENDING credit card deposits
    console.log('\n2️⃣  CHECKING PENDING CREDIT CARD DEPOSITS:');
    console.log('-'.repeat(60));
    
    const { data: pendingDeposits } = await supabase
      .from('credit_card_deposits')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    console.log(`Found ${pendingDeposits?.length || 0} PENDING credit card deposits:`);
    pendingDeposits?.forEach(d => {
      console.log(`  - $${d.amount} (Card: ${d.card_number})`);
    });

    // Check 3: Check all transaction types
    console.log('\n3️⃣  ALL TRANSACTION TYPES IN DB:');
    console.log('-'.repeat(60));
    
    const { data: allTx } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    const byType = {};
    allTx?.forEach(t => {
      if (!byType[t.transaction_type]) byType[t.transaction_type] = [];
      byType[t.transaction_type].push(t);
    });

    Object.entries(byType).forEach(([type, list]) => {
      console.log(`${type}: ${list.length} records`);
      list.slice(0, 2).forEach(t => {
        console.log(`  - $${t.amount} | Status: ${t.status} | User: ${t.user_id.substring(0, 8)}...`);
      });
    });

    console.log('\n' + '='.repeat(60));
    console.log('💡 ISSUE DIAGNOSIS:');
    console.log('='.repeat(60));
    
    if ((pendingTx?.length || 0) + (pendingDeposits?.length || 0) === 0) {
      console.log('❌ NO PENDING REQUESTS FOUND');
      console.log('   This is why admin can\'t see requests on different devices!');
      console.log('   >> NEED TO CREATE TEST DATA');
    } else {
      console.log('✅ REQUESTS ARE IN DATABASE');
      console.log(`   - ${pendingTx?.length || 0} pending transactions (deposits/withdrawals)`);
      console.log(`   - ${pendingDeposits?.length || 0} pending credit card deposits`);
      console.log('   >> Problem might be in LOADING or SYNCING');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

diagnoseRequestStorage();
