const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminFullLoad() {
  console.log('=== Simulating Full Admin Login & Data Load ===\n');

  try {
    // Step 1: Load all users
    console.log('👥 Step 1: Loading all users from user_profiles...');
    const { data: allUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('*');

    if (usersError) {
      console.error('❌ Error:', usersError.message);
    } else {
      console.log(`✅ Loaded ${allUsers?.length || 0} users:`);
      allUsers?.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.email} - ID: ${u.id.substring(0, 8)}... (Admin: ${u.is_admin})`);
      });
    }

    // Step 2: Load all transactions
    console.log('\n📊 Step 2: Loading all transactions...');
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (txError) {
      console.error('❌ Error:', txError.message);
    } else {
      console.log(`✅ Loaded ${transactions?.length || 0} transactions`);
      transactions?.slice(0, 2).forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.transaction_type} - $${t.amount} (User: ${t.user_id.substring(0, 8)}...)`);
      });
    }

    // Step 3: Load all deposits
    console.log('\n💳 Step 3: Loading all credit card deposits...');
    const { data: deposits, error: depError } = await supabase
      .from('credit_card_deposits')
      .select('*')
      .order('created_at', { ascending: false });

    if (depError) {
      console.error('❌ Error:', depError.message);
    } else {
      console.log(`✅ Loaded ${deposits?.length || 0} deposits`);
      deposits?.slice(0, 2).forEach((d, i) => {
        console.log(`  ${i + 1}. $${d.amount} - ${d.status} (User: ${d.user_id.substring(0, 8)}...)`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('ADMIN DASHBOARD SHOULD SHOW:');
    console.log(`  ✅ Total users in dropdown: ${allUsers?.length || 0}`);
    console.log(`  ✅ Total transactions: ${transactions?.length || 0}`);
    console.log(`  ✅ Total deposits: ${deposits?.length || 0}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminFullLoad();
