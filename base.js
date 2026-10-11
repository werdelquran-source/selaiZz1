// Base adapter interface — every marketplace implements these two methods.
export class MarketplaceAdapter {
  constructor(credentials) {
    this.credentials = credentials; // { apiKey, apiSecret, shopDomain, ... }
  }
  async syncProduct(_product) {
    throw new Error("syncProduct() not implemented");
  }
  async handleWebhook(_payload, _headers) {
    throw new Error("handleWebhook() not implemented");
  }
}
