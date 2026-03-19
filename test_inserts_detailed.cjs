const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInserts() {
  console.log('=== Testing Supabase Inserts ===\n');

  // Test 1: transactions table
  console.log('1️⃣ Testing transactions table...');
  const txId = 'test_tx_' + Date.now();
  const { error: txErr } = await supabase
    .from('transactions')
    .insert({
      user_id: 'test-user-id',
      transaction_type: 'DEPOSIT',
      amount: 100,
      method: 'card',
      status: 'pending',
      description: 'Test deposit',
      created_at: new Date().toISOString()
    });
  
  if (txErr) {
    console.log('   ❌ Error:', txErr.code, '-', txErr.message);
  } else {
    console.log('   ✅ INSERT SUCCESS');
  }

  // Test 2: credit_card_deposits table
  console.log('\n2️⃣ Testing credit_card_deposits table...');
  const ccId = 'test_cc_' + Date.now();
  const { error: ccErr } = await supabase
    .from('credit_card_deposits')
    .insert({
      user_id: 'test-user-id',
      amount: 100,
      card_number: 'xxxx1234',
      cardholder_name: 'Test User',
      expiry_date: '12/25',
      status: 'PENDING',
      created_at: new Date().toISOString()
    });
  
  if (ccErr) {
    console.log('   ❌ Error:', ccErr.code, '-', ccErr.message);
  } else {
    console.log('   ✅ INSERT SUCCESS');
  }

  // Test 3: user_funded_accounts table
  console.log('\n3️⃣ Testing user_funded_accounts table...');
  const faId = 'test_fa_' + Date.now();
  const { error: faErr } = await supabase
    .from('user_funded_accounts')
    .insert({
      user_id: 'test-user-id',
      plan_id: 'plan-1',
      plan_name: 'Test Plan',
      capital: 1000,
      price: 100,
      profit_target: 20,
      max_drawdown: 10,
      status: 'PENDING_APPROVAL',
      current_balance: 1000,
      purchased_at: new Date().toISOString()
    });
  
  if (faErr) {
    console.log('   ❌ Error:', faErr.code, '-', faErr.message);
  } else {
    console.log('   ✅ INSERT SUCCESS');
  }

  console.log('\n✅ Test complete');
}

testInserts().catch(console.error);
