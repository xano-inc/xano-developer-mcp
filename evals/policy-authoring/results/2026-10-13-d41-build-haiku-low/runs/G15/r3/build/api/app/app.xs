// The customer-facing app API: invoices, customers, payments, shipping, clinic, shop and support.
api_group app {
  canonical = "app"
  swagger = {active: false}
  middleware = {pre: [{name: "rate_limit"}]}
  guid = "iiMRk2q0C4ABm9XQMKzv5iE-43U"
}