// functions/api/order.js
// Cloudflare Pages Function: receives Cash on Delivery orders and stores them in Sanity.

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { customer, items, total } = payload || {};

  if (!customer || !Array.isArray(items) || !items.length) {
    return json({ error: "Missing customer or items" }, 400);
  }

  const { name, phone, city, address, notes } = customer;
  if (!name || !phone || !city || !address) {
    return json({ error: "Missing required customer fields" }, 400);
  }

  const projectId = env.SANITY_PROJECT_ID;
  const dataset = env.SANITY_DATASET || "production";
  const apiVersion = env.SANITY_API_VERSION || "2021-10-21";
  const token = env.SANITY_TOKEN;

  if (!projectId || !dataset || !token) {
    return json({ error: "Sanity environment variables not configured" }, 500);
  }

  const now = new Date().toISOString();

  const sanityItems = items.map((it) => ({
    _type: "orderItem",
    productId: it.id || null,
    title: it.title || "",
    quantity: typeof it.quantity === "number" ? it.quantity : 1,
    price: typeof it.price === "number" ? it.price : 0,
  }));

  const mutations = [
    {
      create: {
        _type: "order",
        createdAt: now,
        status: "pending",
        customerName: name,
        phone,
        city,
        address,
        notes: notes || "",
        items: sanityItems,
        totalPrice: typeof total === "number" ? total : 0,
      },
    },
  ];

  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mutations }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Sanity mutate error", text);
      return json({ error: "Sanity mutation failed" }, 500);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }

    const orderId = data?.results?.[0]?.id || null;

    return json({ ok: true, orderId }, 200);
  } catch (err) {
    console.error("Order handler error", err);
    return json({ error: "Server error" }, 500);
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
