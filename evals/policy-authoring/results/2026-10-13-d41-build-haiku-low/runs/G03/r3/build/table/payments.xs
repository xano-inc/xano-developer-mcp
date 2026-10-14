// Card and bank payments taken for invoices.
table payments {
  auth = false
  tags = ["pci"]

  schema {
    int id
    timestamp created_at?=now
    int invoice_id {
      table = "invoices"
    }
  
    decimal amount
    text card_number? {sensitive = true}
    text card_cvv? {sensitive = true}
    text card_expiry? {sensitive = true}
    text cardholder_name? {sensitive = true}
    text bank_account_number? {sensitive = true}
    text bank_routing_number? {sensitive = true}
    text stripe_payment_intent_id?
    text status?=pending
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "iXveQz3WkrNn2yy_Kh9L6UYCuMo"
}