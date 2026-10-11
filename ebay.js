import { MarketplaceAdapter } from "./base.js";

export class EbayAdapter extends MarketplaceAdapter {
  async syncProduct(product) {
    const res = await fetch("https://api.ebay.com/sell/inventory/v1/inventory_item/" + encodeURIComponent(product.sku || product.id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.credentials.accessToken,
      },
      body: JSON.stringify({ product: { title: product.name, description: product.description || "" }, availability: { shipToLocationAvailability: { quantity: product.stock } } }),
    });
    if (!res.ok && res.status !== 204) throw new Error(`eBay sync failed: ${res.status}`);
    return { ok: true };
  }

  async handleWebhook(payload) {
    // eBay Marketplace Account Deletion / order webhooks — validate via X-EBAY-SIGNATURE header (JWE)
    return { received: true, payload };
  }
}
