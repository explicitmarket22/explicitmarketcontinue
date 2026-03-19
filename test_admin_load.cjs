const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLoad() {
  console.log('=== Testing Admin Data Load (Simulating loadUserDataFromSupabase) ===\n');

  // Simulate admin loading all data
  console.log('👑 Admin login detected - loading ALL user data\n');

  // 1. Load all transactions
  console.log('📊 Loading transactions...');
  const { data: allTransactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (txError) {
    console.log('   ❌ Error:', txError.message);
  } else {
    console.log(`   ✅ Loaded ${allTransactions.length} transactions`);
    if (allTransactions.length > 0) {
      console.log('   Sample:');
      allTransactions.slice(0, 2).forEach(t => {
        console.log(`     - ${t.transaction_type} $${t.amount} by user ${t.user_id}`);
      });
    }
  }

  // 2. Load all credit card deposits
  console.log('\n💳 Loading credit card deposits...');
  const { data: allDeposits, error: depError } = await supabase
    .from('credit_card_deposits')
    .select('*')
    .order('created_at', { ascending: false });

  if (depError) {
    console.log('   ❌ Error:', depError.message);
  } else {
    console.log(`   ✅ Loaded ${allDeposits.length} credit card deposits`);
    if (allDeposits.length > 0) {
      console.log('   Sample:');
      allDeposits.slice(0, 2).forEach(d => {
        console.log(`     - $${d.amount} deposit by user ${d.user_id} (${d.status})`);
      });
    }
  }

  // 3. Load all funded accounts  
  console.log('\n🎯 Loading funded accounts...');
  const { data: allFunded, error: fundError } = await supabase
    .from('user_funded_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (fundError) {
    console.log('   ❌ Error:', fundError.message);
  } else {
    console.log(`   ✅ Loaded ${allFunded.length} funded accounts`);
    if (allFunded.length > 0) {
      console.log('   Samples:', allFunded.map(f => `${f.plan_name} (${f.status})`).join(', '));
    }
  }

  // Summary
  console.log('\n=== ADMIN VIEW SUMMARY ===');
  console.log(`Total Transactions: ${allTransactions.length}`);
  console.log(`Total Deposits: ${allDeposits.length}`);
  console.log(`Total Funded Accounts: ${allFunded.length}`);
  
  if (allTransactions.length > 0 && allDeposits.length > 0) {
    console.log('\n✅ SUCCESS: Admin can see all user activity!');
  }
}

testAdminLoad().catch(console.error);
