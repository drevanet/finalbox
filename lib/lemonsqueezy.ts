import { createHmac, timingSafeEqual } from "node:crypto";

export async function createCheckout(variantId: string, user: { id: string; email: string }) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const store = process.env.LEMONSQUEEZY_STORE_ID;
  if (!apiKey || !store || !variantId) throw new Error("Lemon Squeezy is not configured. Add store, API key, and variant IDs to .env.");
  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/vnd.api+json", "Content-Type": "application/vnd.api+json" },
    body: JSON.stringify({ data: { type: "checkouts", attributes: { checkout_data: { email: user.email, custom: { user_id: user.id } }, product_options: { redirect_url: `${process.env.APP_URL}/subscription?checkout=success` } }, relationships: { store: { data: { type: "stores", id: String(store) } }, variant: { data: { type: "variants", id: String(variantId) } } } } })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.errors?.[0]?.detail || "Could not create checkout.");
  return payload.data.attributes.url as string;
}
export function validWebhook(raw: string, signature: string | null) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(digest), b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
