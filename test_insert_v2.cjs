const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://wlfmhwbsqocrvylufnyt.supabase.co",
  "sb_publishable_xfbsc_CFq8nN45MuGfvzng_1fu8TqBu"
);

async function testSchema() {
  console.log("🔍 Testing transactions table schema and insert...\n");

  // Try 1: Insert without ID (let Supabase generate)
  console.log("Test 1️⃣ : Insert without specifying ID");
  const { data: data1, error: error1 } = await supabase
    .from("transactions")
    .insert({
      user_id: "existing-user-id",
      type: "DEPOSIT",
      amount: 100,
      method: "credit_card",
      status: "pending",
      created_at: new Date().toISOString()
    })
    .select();

  if (error1) {
    console.log("❌ Error:", error1.code, "-", error1.message);
    if (error1.details) console.log("Details:", error1.details);
  } else {
    console.log("✅ Success! Inserted:", data1);
  }

  // Try 2: Get schema info if table has data
  console.log("\n\nTest 2️⃣ : Check table structure by querying one row");
  const { data: data2, error: error2 } = await supabase
    .from("transactions")
    .select("*")
    .limit(1);

  if (error2) {
    console.log("❌ Error:", error2.code, "-", error2.message);
  } else {
    if (data2 && data2.length > 0) {
      console.log("✅ Table columns (from sample row):", Object.keys(data2[0]));
    } else {
      console.log("⚠️  Table is empty, cannot see schema");
    }
  }

  // Try 3: Check RLS policies
  console.log("\n\nTest 3️⃣ : RLS Status Check");
  const { data: policies, error: pError } = await supabase.rpc('list_rls_policies', {
    table_name: 'transactions'
  }).catch(() => ({ data: null, error: "RPC not available" }));

  if (pError) {
    console.log("⚠️  Cannot check RLS via RPC:", pError);
  } else {
    console.log("RLS Info:", policies);
  }
}

testSchema();
