import crypto from "crypto";
import { MarketplaceAdapter } from "./base.js";

// SP-API is signed with AWS Signature Version 4. This is the canonical skeleton:
// in production, add @aws-sdk/signature-v4 and refresh LWA tokens.
export class AmazonAdapter extends MarketplaceAdapter {
  buildSignedRequest(method, path, payload = "") {
    const { accessKey, secretKey, region = "eu-west-1" } = this.credentials;
    const host = `sellingpartnerapi-${region}.amazon.com`;
    const datetime = new Date().toISOString().replace(/[-:]|\.\d{3}/g, "");
    const canonical = [method, path, "", `host:${host}`, "", crypto.createHash("sha256").update(payload).digest("hex")].join("\n");
    const stringToSign = ["AWS4-HMAC-SHA256", datetime, datetime.slice(0, 8) + "/" + region + "/execute-api/aws4_request", crypto.createHash("sha256").update(canonical).digest("hex")].join("\n");
    const kDate = crypto.createHmac("sha256", "AWS4" + secretKey).update(datetime.slice(0, 8)).digest();
    const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
    const kService = crypto.createHmac("sha256", kRegion).update("execute-api").digest();
    const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
    const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");
    return { host, headers: { host, "x-amz-date": datetime, Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${datetime.slice(0, 8)}/${region}/execute-api/aws4_request, SignedHeaders=host, Signature=${signature}` } };
  }

  async syncProduct(product) {
    const req = this.buildSignedRequest("PUT", "/listings/2021-08-01/items/" + encodeURIComponent(product.sku || product.id), JSON.stringify({ productType: "PRODUCT", attributes: { item_name: [{ value: product.name }], purchasable_offer: [{ currency: product.currency, our_price: [{ value: String(product.price) }] }] } }));
    const res = await fetch(`https://${req.host}/listings/2021-08-01/items/` + encodeURIComponent(product.sku || product.id), { method: "PUT", headers: { ...req.headers, "Content-Type": "application/json" }, body: JSON.stringify({ productType: "PRODUCT" }) });
    if (!res.ok) throw new Error(`Amazon sync failed: ${res.status}`);
    return res.json();
  }

  async handleWebhook(payload) {
    // Amazon Notifications (SQS) — verify via SNS signature before processing
    return { received: true, payload };
  }
}
