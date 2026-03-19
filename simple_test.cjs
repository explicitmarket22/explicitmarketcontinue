const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://wlfmhwbsqocrvylufnyt.supabase.co",
  "sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu"
);

async function test() {
  console.log("Test 1: Simple select from transactions table");
  const { data, error } = await supabase
    .from("transactions")
    .select();
  
  console.log("Error:", error);
  console.log("Data:", data);

  console.log("\n\nTest 2: List all available tables");
  // Get all tables from the schema
  const { data: tables } = await supabase
    .schema();
  
  console.log("Tables:", tables);
}

test().catch(console.error);
