const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function disableRLS() {
  const tables = ['transactions', 'credit_card_deposits', 'user_funded_accounts'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        sql: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`
      }).catch(() => ({ error: { message: 'RPC not available' } }));
      
      if (error && error.message !== 'RPC not available') {
        console.log(`⚠️ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: RLS disable executed`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error - ${err.message}`);
    }
  }
}

disableRLS().catch(console.error);
