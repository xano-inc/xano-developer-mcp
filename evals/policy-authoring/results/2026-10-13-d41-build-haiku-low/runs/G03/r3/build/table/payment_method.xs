// A customer's saved card, as returned by the card processor.
table payment_method {
  auth = false
  tags = ["pci"]

  schema {
    int id
    int customer_id {
      table = "customers"
    }
  
    text card_brand?
    text card_last4? {sensitive = true}
    text card_token?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "C8MVmiKKr57ei8XhAsgA4NjAQEc"
}