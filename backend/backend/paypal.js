require("dotenv").config();

const { PAYPALID, PAYPALKEY } = process.env;

const baseUrl = "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
  const auth = Buffer.from(PAYPALID + ":" + PAYPALKEY).toString("base64");
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

module.exports = {
  createProduct: async (req, res) => {
    const accessToken = await generateAccessToken();

    const url = `${baseUrl}/v1/catalogs/products`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-PAYPAL-SECURITY-CONTEXT":
          '{"consumer":{"accountNumber":1181198218909172527,"merchantId":"5KW8F2FXKX5HA"},"merchant":{"accountNumber":1659371090107732880,"merchantId":"2J6QB8YJQSJRJ"},"apiCaller":{"clientId":"AdtlNBDhgmQWi2xk6edqJVKklPFyDWxtyKuXuyVT-OgdnnKpAVsbKHgvqHHP","appId":"APP-6DV794347V142302B","payerId":"2J6QB8YJQSJRJ","accountNumber":"1659371090107732880"},"scopes":["https://api-m.paypal.com/v1/subscription/.*","https://uri.paypal.com/services/subscription","openid"]}',
        "Content-Type": "application/json",
        Accept: "application/json",
        "PayPal-Request-Id": Date.now(),
        Prefer: "return=representation",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: "App Subscription",
        description: "Subscripción para tatuadores",
        type: "SERVICE",
        category: "SOFTWARE",
      }),
    });
    const data = await response.json();
    return data;
  },
  subscription: async (product) => {
    const accessToken = await generateAccessToken();

    const url = `${baseUrl}/v1/billing/plans`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-PAYPAL-SECURITY-CONTEXT":
          '{"consumer":{"accountNumber":1181198218909172527,"merchantId":"5KW8F2FXKX5HA"},"merchant":{"accountNumber":1659371090107732880,"merchantId":"2J6QB8YJQSJRJ"},"apiCaller":{"clientId":"AdtlNBDhgmQWi2xk6edqJVKklPFyDWxtyKuXuyVT-OgdnnKpAVsbKHgvqHHP","appId":"APP-6DV794347V142302B","payerId":"2J6QB8YJQSJRJ","accountNumber":"1659371090107732880"},"scopes":["https://api-m.paypal.com/v1/subscription/.*","https://uri.paypal.com/services/subscription","openid"]}',
        "Content-Type": "application/json",
        Accept: "application/json",
        "PayPal-Request-Id": product.id + Date.now(),
        Prefer: "return=representation",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: product.id,
        name: product.name,
        description: product.description,
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: { interval_unit: "MONTH", interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 12,
            pricing_scheme: {
              fixed_price: { value: "1.99", currency_code: "USD" },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: { value: "0", currency_code: "USD" },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3,
        },
        taxes: { percentage: "0", inclusive: false },
      }),
    });
    const data = await response.json();
    return data;
  },
  async getSubscriptionData(id) {
    const accessToken = await generateAccessToken();

    const url = `${baseUrl}/v1/billing/plans/${id}`;
    const response = await fetch(url, {
      headers: {
        "X-PAYPAL-SECURITY-CONTEXT":
          '{"consumer":{"accountNumber":1181198218909172527,"merchantId":"5KW8F2FXKX5HA"},"merchant":{"accountNumber":1659371090107732880,"merchantId":"2J6QB8YJQSJRJ"},"apiCaller":{"clientId":"AdtlNBDhgmQWi2xk6edqJVKklPFyDWxtyKuXuyVT-OgdnnKpAVsbKHgvqHHP","appId":"APP-6DV794347V142302B","payerId":"2J6QB8YJQSJRJ","accountNumber":"1659371090107732880"},"scopes":["https://api-m.paypal.com/v1/subscription/.*","https://uri.paypal.com/services/subscription","openid"]}',
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data;
  },
};
