const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://wlfmhwbsqocrvylufnyt.supabase.co",
  "sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu"
);

async function checkSchema() {
  console.log("🔍 Checking actual database schema...\n");

  // Query information_schema for columns
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'transactions')
    .eq('table_schema', 'public');

  if (error) {
    console.log("❌ Error querying schema:", error);
  } else {
    console.log("✅ Columns in 'transactions' table:");
    if (data && data.length > 0) {
      data.forEach((col) => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
    } else {
      console.log("  No columns found!");
    }
  }

  // Also check if table exists
  console.log("\n\n🔍 Checking if 'transactions' table exists...");
  const { data: tables, error: tableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'transactions');

  if (tableError) {
    console.log("❌ Error:", tableError);
  } else {
    console.log("Tables matching 'transactions':", tables);
  }

  // List ALL tables in public schema
  console.log("\n\n🔍 All tables in public schema:");
  const { data: allTables, error: allTablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (allTablesError) {
    console.log("❌ Error:", allTablesError);
  } else {
    console.log("Tables found:");
    if (allTables) {
      allTables.forEach((t) => console.log(`  - ${t.table_name}`));
    }
  }
}

checkSchema();
