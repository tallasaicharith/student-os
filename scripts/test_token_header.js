require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

async function testHeaderVsQuery() {
  console.log("=== TESTING GOOGLE AI STUDIO AUTHENTICATION ===");
  console.log("Token:", key ? `${key.slice(0, 15)}...` : "MISSING");

  const model = "gemini-2.5-flash";

  // Test 1: Query parameter ?key=...
  console.log("\n1. Testing Query Param (?key=...):");
  try {
    const res1 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Hello" }] }] })
    });
    console.log("Query Param Status:", res1.status, res1.statusText);
    if (!res1.ok) console.log("Query Param Error:", await res1.text());
    else console.log("Query Param Success:", (await res1.json()).candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (e) {
    console.error("Query param error:", e.message);
  }

  // Test 2: Authorization Header (Authorization: Bearer AQ....)
  console.log("\n2. Testing Bearer Header (Authorization: Bearer ...):");
  try {
    const res2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Hello" }] }] })
    });
    console.log("Bearer Header Status:", res2.status, res2.statusText);
    if (!res2.ok) console.log("Bearer Header Error:", await res2.text());
    else console.log("Bearer Header Success:", (await res2.json()).candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (e) {
    console.error("Header error:", e.message);
  }

  // Test 3: x-goog-api-key Header
  console.log("\n3. Testing x-goog-api-key Header:");
  try {
    const res3 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key
      },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Hello" }] }] })
    });
    console.log("x-goog-api-key Status:", res3.status, res3.statusText);
    if (!res3.ok) console.log("x-goog-api-key Error:", await res3.text());
    else console.log("x-goog-api-key Success:", (await res3.json()).candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (e) {
    console.error("x-goog-api-key error:", e.message);
  }
}

testHeaderVsQuery();
