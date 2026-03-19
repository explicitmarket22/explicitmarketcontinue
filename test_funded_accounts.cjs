const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFundedAccounts() {
  // Get a valid plan_id from the plans table
  const { data: plans, error: planError } = await supabase
    .from('plans')
    .select('id')
    .limit(1);
  
  if (planError || !plans || plans.length === 0) {
    console.log('❌ Could not fetch plans:', planError?.message);
    return;
  }

  const planId = plans[0].id;
  console.log('✅ Using plan ID:', planId);

  // Get a real user ID
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1);
  
  const userId = users[0].id;
  console.log('✅ Using user ID:', userId);

  // Now test the insert
  console.log('\n🧪 Testing user_funded_accounts insert...');
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
    console.log('❌ Error:', faErr.code, '-', faErr.message);
  } else {
    console.log('✅ INSERT SUCCESS - user_funded_accounts working!');
  }
}

testFundedAccounts().catch(console.error);
