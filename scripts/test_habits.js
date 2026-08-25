async function testHabits() {
  console.log("=== TESTING HABITS API ENDPOINTS ===");

  // 1. GET /api/habits
  try {
    const res = await fetch("http://localhost:3000/api/habits");
    console.log("GET /api/habits status:", res.status, res.statusText);
    const data = await res.json();
    console.log(`GET /api/habits returned ${Array.isArray(data) ? data.length : 0} habits`);
    if (Array.isArray(data) && data.length > 0) {
      console.log("Sample habit:", data[0]);
    } else {
      console.log("Data returned:", data);
    }
  } catch (err) {
    console.error("GET error:", err.message);
  }

  // 2. POST /api/habits (Create new habit)
  try {
    const res = await fetch("http://localhost:3000/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Read 30 mins", emoji: "📖" }),
    });
    console.log("\nPOST /api/habits status:", res.status, res.statusText);
    const created = await res.json();
    console.log("Created Habit Output:", created);
  } catch (err) {
    console.error("POST error:", err.message);
  }
}

testHabits();
