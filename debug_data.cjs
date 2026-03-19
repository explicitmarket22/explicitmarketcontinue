const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugData() {
  console.log('🔍 Debugging Supabase Data\n');
  
  try {
    // Check transactions
    console.log('1️⃣ Transactions:');
    const { data: txns, error: txnErr } = await supabase
      .from('transactions')
      .select('*')
      .limit(5);
    
    if (txnErr) {
      console.log('❌ Error:', txnErr.message);
    } else {
      console.log(`✅ Found ${txns.length} transactions`);
      txns.forEach(t => {
        console.log(`   - ${t.type}: ${t.amount} (${t.status}) - User: ${t.user_id}`);
      });
    }

    // Check credit card deposits
    console.log('\n2️⃣ Credit Card Deposits:');
    const { data: deposits, error: depErr } = await supabase
      .from('credit_card_deposits')
      .select('*')
      .limit(5);
    
    if (depErr) {
      console.log('❌ Error:', depErr.message);
    } else {
      console.log(`✅ Found ${deposits?.length || 0} deposits`);
      if (deposits) {
        deposits.forEach(d => {
          console.log(`   - $${d.amount} (${d.status}) - User: ${d.user_id}`);
        });
      }
    }

    // Check funded accounts
    console.log('\n3️⃣ Funded Accounts:');
    const { data: funded, error: fundErr } = await supabase
      .from('user_funded_accounts')
      .select('*')
      .limit(5);
    
    if (fundErr) {
      console.log('❌ Error:', fundErr.message);
    } else {
      console.log(`✅ Found ${funded?.length || 0} funded accounts`);
      if (funded) {
        funded.forEach(f => {
          console.log(`   - ${f.plan_name}: $${f.capital} (${f.status}) - User: ${f.user_id}`);
        });
      }
    }

    // Check users
    console.log('\n4️⃣ Users in Database:');
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, email, full_name');
    
    console.log(`✅ Found ${users?.length || 0} users:`);
    users?.forEach(u => {
      console.log(`   - ${u.email} (${u.full_name}) [ID: ${u.id}]`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugData();
