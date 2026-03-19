const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCriticalDashboardData() {
  console.log('=== CRITICAL ADMIN DASHBOARD DATA TEST ===\n');
  console.log('This test verifies all data the admin should see:\n');

  try {
    // 1. Load all users WITH their balances
    console.log('1️⃣  USERS WITH ACTUAL BALANCES:');
    console.log('-'.repeat(60));
    
    const { data: users } = await supabase
      .from('user_profiles')
      .select('*');

    if (users && users.length > 0) {
      for (const u of users) {
        const { data: balanceData } = await supabase
          .from('user_balances')
          .select('balance')
          .eq('user_id', u.id)
          .single();
        
        console.log(`📊 ${u.email}`);
        console.log(`   ID: ${u.id}`);
        console.log(`   Balance: $${balanceData?.balance || 4000}`);
        console.log(`   Admin: ${u.is_admin ? '✅ YES' : '❌ NO'}`);
        console.log('');
      }
    }

    // 2. Load all transactions (deposits + withdrawals)
    console.log('\n2️⃣  ALL TRANSACTIONS:');
    console.log('-'.repeat(60));
    
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (transactions && transactions.length > 0) {
      const userMap = new Map(users.map(u => [u.id, u.email]));
      
      const deposits = transactions.filter(t => t.transaction_type === 'DEPOSIT');
      const withdrawals = transactions.filter(t => t.transaction_type === 'WITHDRAWAL');

      console.log(`💳 DEPOSITS: ${deposits.length}`);
      deposits.forEach((d) => {
        console.log(`   - $${d.amount} from ${userMap.get(d.user_id)} | Status: ${d.status}`);
      });

      console.log(`\n💸 WITHDRAWALS: ${withdrawals.length}`);
      withdrawals.forEach((w) => {
        console.log(`   - $${w.amount} from ${userMap.get(w.user_id)} | Status: ${w.status}`);
      });
    }

    // 3. Load credit card deposits
    console.log('\n3️⃣  CREDIT CARD DEPOSITS (Requests):');
    console.log('-'.repeat(60));
    
    const { data: deposits } = await supabase
      .from('credit_card_deposits')
      .select('*')
      .order('created_at', { ascending: false });

    if (deposits && deposits.length > 0) {
      deposits.forEach((d) => {
        console.log(`💳 $${d.amount} | Card: ${d.card_number} | Status: ${d.status}`);
        console.log(`   Holder: ${d.cardholder_name} | Expiry: ${d.expiry_date}`);
      });
    } else {
      console.log('ℹ️  No credit card deposits found');
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY - ADMIN DASHBOARD SHOULD DISPLAY:');
    console.log('='.repeat(60));
    console.log(`✅ ${users?.length || 0} Users`);
    console.log(`✅ ${transactions?.length || 0} Total Transactions`);
    console.log(`   - 💳 ${transactions?.filter(t => t.transaction_type === 'DEPOSIT').length || 0} Deposits`);
    console.log(`   - 💸 ${transactions?.filter(t => t.transaction_type === 'WITHDRAWAL').length || 0} Withdrawals`);
    console.log(`✅ ${deposits?.length || 0} Credit Card Deposit Requests`);
    console.log('');
    console.log('⚡ APPROVE/REJECT BUTTONS should work on all of these!');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCriticalDashboardData();
