const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminDataLoading() {
  console.log('=== Testing Admin Cross-Device Data Loading ===\n');

  try {
    // Test 1: Load all transactions (what admin should see)
    console.log('📊 Loading ALL transactions (Admin view)...');
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (txError) {
      console.error('❌ Error loading transactions:', txError.message);
    } else {
      console.log(`✅ Found ${transactions?.length || 0} transactions`);
      if (transactions && transactions.length > 0) {
        console.log('Sample transaction:', JSON.stringify(transactions[0], null, 2));
      }
    }

    // Test 2: Load all credit card deposits
    console.log('\n💳 Loading ALL credit card deposits (Admin view)...');
    const { data: deposits, error: depError } = await supabase
      .from('credit_card_deposits')
      .select('*')
      .order('created_at', { ascending: false });

    if (depError) {
      console.error('❌ Error loading deposits:', depError.message);
    } else {
      console.log(`✅ Found ${deposits?.length || 0} credit card deposits`);
      if (deposits && deposits.length > 0) {
        console.log('Sample deposit:', JSON.stringify(deposits[0], null, 2));
      }
    }

    // Test 3: Load all funded accounts
    console.log('\n🎯 Loading ALL funded accounts (Admin view)...');
    const { data: funded, error: fundError } = await supabase
      .from('user_funded_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (fundError) {
      console.error('❌ Error loading funded accounts:', fundError.message);
    } else {
      console.log(`✅ Found ${funded?.length || 0} funded accounts`);
      if (funded && funded.length > 0) {
        console.log('Sample funded account:', JSON.stringify(funded[0], null, 2));
      }
    }

    // Test 4: Check what's in user_profiles
    console.log('\n👥 Checking user_profiles table...');
    const { data: users, error: userError } = await supabase
      .from('user_profiles')
      .select('*');

    if (userError) {
      console.error('❌ Error loading users:', userError.message);
    } else {
      console.log(`✅ Found ${users?.length || 0} users in Supabase`);
      users?.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.email} (ID: ${u.id}, isAdmin: ${u.is_admin})`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Admin data loading test complete');
    console.log('Summary:');
    console.log(`  - Transactions: ${transactions?.length || 0}`);
    console.log(`  - Deposits: ${deposits?.length || 0}`);
    console.log(`  - Funded Accounts: ${funded?.length || 0}`);
    console.log(`  - Total Users: ${users?.length || 0}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminDataLoading();
