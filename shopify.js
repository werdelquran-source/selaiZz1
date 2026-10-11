import crypto from "crypto";
import { MarketplaceAdapter } from "./base.js";

export class ShopifyAdapter extends MarketplaceAdapter {
  async syncProduct(product) {
    const domain = this.credentials.shopDomain;
    const res = await fetch(`https://${domain}/admin/api/2024-07/products.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.credentials.accessToken,
      },
      body: JSON.stringify({
        product: {
          title: product.name,
          body_html: product.description || "",
          variants: [{ price: String(product.price), inventory_quantity: product.stock }],
        },
      }),
    });
    if (!res.ok) throw new Error(`Shopify sync failed: ${res.status}`);
    return res.json();
  }

  // Always verify webhook HMAC before trusting the payload
  verifyWebhook(rawBody, hmacHeader) {
    const digest = crypto
      .createHmac("sha256", this.credentials.webhookSecret)
      .update(rawBody, "utf8")
      .digest("base64");
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  }

  async handleWebhook(rawBody, headers) {
    const hmac = headers["x-shopify-hmac-sha256"];
    if (!hmac || !this.verifyWebhook(rawBody, hmac)) {
      throw new Error("Invalid webhook signature");
    }
    const payload = JSON.parse(rawBody);
    // TODO: map Shopify order -> internal Order via orderService
    return { received: true, topic: headers["x-shopify-topic"], id: payload.id };
  }
}
