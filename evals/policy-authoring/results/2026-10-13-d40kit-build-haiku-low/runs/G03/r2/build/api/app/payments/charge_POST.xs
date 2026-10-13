// Charges a card for an invoice through Stripe and stores the payment.
query "payments/charge" verb=POST {
  api_group = "app"
  auth = "users"

  input {
    int invoice_id
    decimal amount
    text card_number
    text card_cvv
    text card_expiry
    text cardholder_name
  }

  stack {
    api.request {
      url = "https://api.stripe.com/v1/payment_intents"
      method = "POST"
      params = {
        amount  : $input.amount
        currency: "usd"
        confirm : true
      }
    
      headers = ["Authorization: Bearer " ~ $env.STRIPE_SECRET_KEY]
      timeout = 20
    } as $intent
  
    db.add payments {
      data = {
        invoice_id              : $input.invoice_id
        amount                  : $input.amount
        stripe_payment_intent_id: $intent.response.result.id
        status                  : "succeeded"
      }
    } as $payment
  }

  response = $payment
  guid = "BNAn_W_szr0DTgVUjmP5wcdQ1UM"
}