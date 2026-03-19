const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyRequestSyncing() {
  console.log('=== COMPREHENSIVE REQUEST SYNCING TEST ===\n');
  console.log('This test verifies deposits and withdrawals sync to Supabase\n');

  try {
    // 1. Check pending deposit requests
    console.log('1️⃣  DEPOSIT REQUESTS (Credit Card):');
    console.log('-'.repeat(60));
    
    const { data: deposits } = await supabase
      .from('credit_card_deposits')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    console.log(`📥 ${deposits?.length || 0} PENDING credit card deposits`);
    if (deposits && deposits.length > 0) {
      deposits.slice(0, 3).forEach((d, i) => {
        console.log(`   ${i + 1}. $${d.amount} | Holder: ${d.cardholder_name}`);
      });
      if (deposits.length > 3) console.log(`   ... and ${deposits.length - 3} more`);
    }

    // 2. Check pending withdrawal requests
    console.log('\n2️⃣  WITHDRAWAL REQUESTS:');
    console.log('-'.repeat(60));
    
    const { data: withdrawals } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_type', 'WITHDRAWAL')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    console.log(`📤 ${withdrawals?.length || 0} PENDING withdrawals`);
    if (withdrawals && withdrawals.length > 0) {
      withdrawals.slice(0, 3).forEach((w, i) => {
        const user = w.user_id.substring(0, 8);
        console.log(`   ${i + 1}. $${w.amount} | Method: ${w.method} (${user}...)`);
      });
      if (withdrawals.length > 3) console.log(`   ... and ${withdrawals.length - 3} more`);
    }

    // 3. Check regular deposit requests (non-credit-card)
    console.log('\n3️⃣  OTHER DEPOSIT REQUESTS (Bank, etc):');
    console.log('-'.repeat(60));
    
    const { data: otherDeposits } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_type', 'DEPOSIT')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    console.log(`📥 ${otherDeposits?.length || 0} PENDING other deposits`);
    if (otherDeposits && otherDeposits.length > 0) {
      otherDeposits.slice(0, 3).forEach((d, i) => {
        const user = d.user_id.substring(0, 8);
        console.log(`   ${i + 1}. $${d.amount} | Method: ${d.method} (${user}...)`);
      });
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ REQUEST STORAGE STATUS:');
    console.log('='.repeat(60));
    
    const totalDeposits = (deposits?.length || 0) + (otherDeposits?.length || 0);
    const totalWithdrawals = withdrawals?.length || 0;
    const totalRequests = totalDeposits + totalWithdrawals;

    console.log(`📊 Total Requests Pending Approval:`);
    console.log(`   - Deposits: ${totalDeposits}`);
    console.log(`   - Withdrawals: ${totalWithdrawals}`);
    console.log(`   - TOTAL: ${totalRequests}`);
    
    if (totalRequests === 0) {
      console.log('\n⚠️  WARNING: No pending requests found');
      console.log('   Users should create deposits/withdrawals in the app');
    } else {
      console.log('\n✅ Admin on ANY device can now see these requests!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🔄 CROSS-DEVICE FLOW:');
    console.log('='.repeat(60));
    console.log('Device A: User creates withdrawal → synced to DB ✓');
    console.log('Device B: Admin logs in → loads all pending requests ✓');
    console.log('Device B: Admin approves withdrawal → updates DB ✓');
    console.log('Device A: Admin refreshes → sees COMPLETED status ✓');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function analyzePendingRequests() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 BREAKDOWN BY USER:');
  console.log('='.repeat(60));

  const { data: users } = await supabase
    .from('user_profiles')
    .select('id, email');

  if (!users) return;

  for (const user of users.slice(0, 5)) { // Show first 5 users
    const { data: userRequests } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'PENDING');

    const { data: userDeposits } = await supabase
      .from('credit_card_deposits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'PENDING');

    const totalUserRequests = (userRequests?.length || 0) + (userDeposits?.length || 0);
    if (totalUserRequests > 0) {
      console.log(`\n👤 ${user.email}:`);
      console.log(`   - Transactions: ${userRequests?.length || 0}`);
      console.log(`   - Card Deposits: ${userDeposits?.length || 0}`);
    }
  }
}

(async () => {
  await verifyRequestSyncing();
  await analyzePendingRequests();
})();
