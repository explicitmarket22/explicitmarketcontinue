const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWithRealIds() {
  // First, get a real user ID from the database
  const { data: users, error: userError } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1);
  
  if (userError || !users || users.length === 0) {
    console.log('❌ Could not fetch users:', userError?.message);
    return;
  }

  const userId = users[0].id;
  console.log('✅ Using real user ID:', userId);

  // Generate a UUID for plan_id
  const planId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (c === 'x' ? Math.random() * 16 | 0 : (Math.random() * 16 | 0 & 0x3 | 0x8)).toString(16));

  console.log('\n=== Testing Inserts with Real IDs ===\n');

  // Test 1: transactions table
  console.log('1️⃣ Testing transactions table...');
  const { error: txErr } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
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
  const { error: ccErr } = await supabase
    .from('credit_card_deposits')
    .insert({
      user_id: userId,
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
  const { error: faErr } = await supabase
    .from('user_funded_accounts')
    .insert({
      user_id: userId,
      plan_id: planId,
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

testWithRealIds().catch(console.error);
