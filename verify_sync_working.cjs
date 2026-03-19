const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySyncWorking() {
  console.log('=== Verifying Data Sync is Working ===\n');

  // Get transaction count
  const { data: txs } = await supabase
    .from('transactions')
    .select('count', { count: 'exact', head: true });
  
  const txCount = txs?.length || 0;
  console.log(`📊 Transactions in DB: ${txCount}`);

  // Get credit card deposits count
  const { data: ccs } = await supabase
    .from('credit_card_deposits')
    .select('count', { count: 'exact', head: true });
  
  const ccCount = ccs?.length || 0;
  console.log(`💳 Credit Card Deposits in DB: ${ccCount}`);

  // Get a sample transaction
  console.log('\n📋 Sample transactions:');
  const { data: sampleTx } = await supabase
    .from('transactions')
    .select('*')
    .limit(3);
  
  if (sampleTx && sampleTx.length > 0) {
    sampleTx.forEach((tx, i) => {
      console.log(`   ${i+1}. ${tx.transaction_type} - $${tx.amount} (${tx.status})`);
    });
  } else {
    console.log('   (No transactions found)');
  }

  // Get user count
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id, email')
    .limit(5);
  
  console.log(`\n👥 Users in system: ${users.length}`);

  console.log('\n✅ SYNC STATUS:');
  if (txCount > 0) {
    console.log('✅ Transactions ARE syncing correctly!');
  } else {
    console.log('⚠️ No transactions synced yet - need to trigger from app');
  }
  
  if (ccCount > 0) {
    console.log('✅ Credit card deposits ARE syncing correctly!');
  } else {
    console.log('⚠️ No deposits synced yet - need to trigger from app');
  }
}

verifySyncWorking().catch(console.error);
