import { ShopifyAdapter } from "./shopify.js";
import { AmazonAdapter } from "./amazon.js";
import { EbayAdapter } from "./ebay.js";

const registry = {
  shopify: ShopifyAdapter,
  amazon: AmazonAdapter,
  ebay: EbayAdapter,
};

export function getAdapter(marketplace, credentials) {
  const Adapter = registry[marketplace];
  if (!Adapter) throw new Error(`Unknown marketplace: ${marketplace}`);
  return new Adapter(credentials);
}
