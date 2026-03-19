const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlfmhwbsqocrvylufnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('🔍 Checking transactions table schema...\n');
  
  try {
    // Get one row to see columns
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);

    if (error) {
      console.log('Error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('Columns in transactions:');
      console.log(Object.keys(data[0]).sort());
    } else {
      console.log('Table is empty. Getting schema info...');
      // Try alternate method
      const { data: checks } = await supabase
        .from('transactions')
        .select()
        .limit(0);
      console.log('Result:', checks);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();
