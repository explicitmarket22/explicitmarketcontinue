const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getSchemas() {
  const tables = ['transactions', 'credit_card_deposits', 'user_funded_accounts'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select()
        .limit(1);
      
      if (error) {
        console.log(`\n❌ ${table}: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log(`\n✅ ${table} columns:`);
        console.log(Object.keys(data[0]).sort().join(', '));
      } else {
        console.log(`\n⚠️ ${table}: Table is empty (but accessible)`);
        // Try with a different approach
        const { data: testData } = await supabase
          .from(table)
          .select()
          .limit(0);
        console.log('   (Empty result set returned)');
      }
    } catch (err) {
      console.log(`\n❌ ${table}: ${err.message}`);
    }
  }
}

getSchemas();
