async function testLiveWebhook() {
  console.log("Enviando evento de prueba a https://tattoo-hub-ops.vercel.app/api/sentry-webhook...");

  const res = await fetch("https://tattoo-hub-ops.vercel.app/api/sentry-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: {
        event_id: "sentry-test-cloud-001",
        title: "Vercel Serverless Gateway Active & Verified",
        message: "Verificación de recepción de errores 24/7 en Vercel, persistencia en Firebase Firestore y despacho a Discord.",
        level: "warning",
        platform: "node/browser",
        environment: "staging"
      }
    })
  });

  console.log("Respuesta status:", res.status);
  const data = await res.json();
  console.log("Respuesta body:", data);
}

testLiveWebhook().catch(console.error);
