async function testAuth() {
  console.log("Probando login en https://tattoo-hub-ops.vercel.app/api/auth...");

  const res = await fetch("https://tattoo-hub-ops.vercel.app/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "admin",
      password: "admin123!"
    })
  });

  console.log("Auth Status:", res.status);
  const data = await res.json();
  console.log("Auth Response:", data);
}

testAuth().catch(console.error);
