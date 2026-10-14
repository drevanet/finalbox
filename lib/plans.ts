export const PLANS = {
  starter: { name: "Starter", price: 7.2, interval: "month", downloads: 20, env: "LEMONSQUEEZY_VARIANT_STARTER" },
  creator: { name: "Creator", price: 8.39, interval: "2 weeks", downloads: 50, env: "LEMONSQUEEZY_VARIANT_CREATOR" },
  studio: { name: "Studio", price: 9.5, interval: "2 weeks", downloads: 100, env: "LEMONSQUEEZY_VARIANT_STUDIO" },
  unlimited: { name: "Unlimited", price: 20.99, interval: "2 weeks", downloads: Infinity, env: "LEMONSQUEEZY_VARIANT_UNLIMITED" }
} as const;
export type PlanKey = keyof typeof PLANS;
export function isPlanKey(value: string): value is PlanKey {
  return Object.prototype.hasOwnProperty.call(PLANS, value);
}
