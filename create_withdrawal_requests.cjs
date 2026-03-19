const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestWithdrawalRequests() {
  console.log('=== Creating Test Withdrawal Requests ===\n');

  try {
    // Get real user IDs from database
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, email')
      .limit(3);

    if (!users || users.length === 0) {
      console.log('❌ No users found');
      return;
    }

    console.log(`Found ${users.length} users. Creating withdrawal requests...\n`);

    // Create withdrawal requests for each non-admin user
    for (const user of users) {
      if (user.email === 'admin@work.com') continue; // Skip admin

      const withdrawalRequest = {
        user_id: user.id,
        transaction_type: 'WITHDRAWAL',
        amount: 500,
        method: 'bank_transfer',
        status: 'PENDING',
        description: 'Test withdrawal request',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(withdrawalRequest)
        .select();

      if (error) {
        console.error(`❌ Error creating withdrawal for ${user.email}:`, error.message);
      } else {
        console.log(`✅ Withdrawal created for ${user.email}`);
        console.log(`   Amount: $${withdrawalRequest.amount}`);
        console.log(`   ID: ${data?.[0]?.id}`);
      }
    }

    // Verify they're now in the database
    console.log('\n' + '='.repeat(60));
    console.log('🔍 Verifying withdrawals in database...\n');

    const { data: allWithdrawals } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_type', 'WITHDRAWAL');

    console.log(`✅ Found ${allWithdrawals?.length || 0} WITHDRAWAL transactions in database`);
    allWithdrawals?.forEach(w => {
      console.log(`   - $${w.amount} | Status: ${w.status} (User: ${w.user_id.substring(0, 8)}...)`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(60));
    console.log('Admin should now see these withdrawal requests when logging in!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

createTestWithdrawalRequests();
