const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getSchema() {
  // Get transactions columns
  const { data: txData } = await supabase.rpc('fetch_columns', { table_name: 'transactions' }).catch(() => ({ data: null }));
  
  // Try direct insert with all possible column names
  console.log('Testing transactions table...');
  
  // Test 1: Try with transaction_type
  const testId = 'test_tx_' + Date.now();
  const { error: err1 } = await supabase.from('transactions').insert({
    id: testId,
    user_id: 'test-user',
    transaction_type: 'DEPOSIT',
    amount: 100,
    method: 'card',
    status: 'pending',
    created_at: new Date().toISOString()
  });
  
  if (!err1) {
    console.log('✅ transactions INSERT SUCCESS with: id, user_id, transaction_type, amount, method, status, created_at');
    // Clean up
    await supabase.from('transactions').delete().eq('id', testId);
  } else {
    console.log('❌ transaction_type failed:', err1.message);
  }

  // Test credit_card_deposits
  console.log('\nTesting credit_card_deposits table...');
  const ccId = 'test_cc_' + Date.now();
  const { error: ccErr } = await supabase.from('credit_card_deposits').insert({
    id: ccId,
    user_id: 'test-user',
    amount: 100,
    status: 'pending',
    created_at: new Date().toISOString()
  });
  
  if (!ccErr) {
    console.log('✅ credit_card_deposits INSERT SUCCESS');
    console.log('   Columns: id, user_id, amount, status, created_at');
    await supabase.from('credit_card_deposits').delete().eq('id', ccId);
  } else {
    console.log('❌ credit_card_deposits basic columns failed:', ccErr.message);
    // Try with card_number, holder_name, etc
    const ccId2 = 'test_cc2_' + Date.now();
    const { error: ccErr2 } = await supabase.from('credit_card_deposits').insert({
      id: ccId2,
      user_id: 'test-user',
      amount: 100,
      card_number: 'xxxx',
      holder_name: 'Test',
      expiry_date: '12/25',
      cvv: '123',
      status: 'pending',
      created_at: new Date().toISOString()
    });
    if (!ccErr2) {
      console.log('✅ credit_card_deposits INSERT SUCCESS with card details');
      await supabase.from('credit_card_deposits').delete().eq('id', ccId2);
    } else {
      console.log('❌ credit_card_deposits with card details failed:', ccErr2.message);
    }
  }

  // Test user_funded_accounts
  console.log('\nTesting user_funded_accounts table...');
  const faId = 'test_fa_' + Date.now();
  const { error: faErr } = await supabase.from('user_funded_accounts').insert({
    id: faId,
    user_id: 'test-user',
    plan_id: 'plan-1',
    plan_name: 'Test Plan',
    capital: 1000,
    price: 100,
    profit_target: 20,
    max_drawdown: 10,
    status: 'pending',
    created_at: new Date().toISOString()
  });
  
  if (!faErr) {
    console.log('✅ user_funded_accounts INSERT SUCCESS');
    await supabase.from('user_funded_accounts').delete().eq('id', faId);
  } else {
    console.log('❌ user_funded_accounts INSERT FAILED:', faErr.message);
  }
}

getSchema().catch(console.error);
