const fetch = require("node-fetch");

const TOKEN = "cand_WhqTEsOOgwBvKoRHLclUzdit"; // replace with your token

const endpoints = [
  {
    name: "Vague Generate",
    url: "https://api.vague.ae/generate",
    body: {
      prompt: "Write a short dramatic script about Cleopatra",
    },
  },
  {
    name: "Vague Chat (OpenAI style)",
    url: "https://api.vague.ae/v1/chat/completions",
    body: {
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "Write a dramatic script about Cleopatra" },
      ],
    },
  },
  {
    name: "Alt Vague Domain",
    url: "https://vague.ae/api/generate",
    body: {
      prompt: "Write a short dramatic script about Cleopatra",
    },
  },
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔍 Testing: ${endpoint.name}`);
    console.log(`URL: ${endpoint.url}`);

    const res = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(endpoint.body),
    });

    const text = await res.text();

    console.log("Status:", res.status);
    console.log("Response:", text.slice(0, 300)); // trim output

  } catch (err) {
    console.log("❌ Error:", err.message);
  }
}

(async () => {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
})();