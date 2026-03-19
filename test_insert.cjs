const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('🧪 Testing Insert to Transactions\n');
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        id: 'test-' + Date.now(),
        user_id: '6184d684-01c9-4020-8473-bb6cf383a166',
        type: 'DEPOSIT',
        amount: 100,
        method: 'TEST',
        status: 'PENDING',
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.log('❌ Insert failed:');
      console.log('Code:', error.code);
      console.log('Message:', error.message);
      console.log('Details:', error.details);
      console.log('\nThis means RLS policies are BLOCKING inserts!');
    } else {
      console.log('✅ Insert successful!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testInsert();
