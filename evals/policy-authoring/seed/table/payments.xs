// Card and bank payments taken for invoices.
table payments {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int invoice_id {
      table = "invoices"
    }
  
    decimal amount
    text card_number?
    text card_cvv?
    text card_expiry?
    text cardholder_name?
    text bank_account_number?
    text bank_routing_number?
    text stripe_payment_intent_id?
    text status?=pending
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "iXveQz3WkrNn2yy_Kh9L6UYCuMo"
}