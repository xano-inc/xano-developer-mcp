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
    debug.log {
      value = "charge attempt " ~ ($input|json_encode)
    }
  
    try_catch {
      try {
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
      }

      catch {
        throw {
          value = "Payment provider unavailable"
        }
      }
    }

    db.add payments {
      data = {
        invoice_id              : $input.invoice_id
        amount                  : $input.amount
        card_number             : $input.card_number
        card_cvv                : $input.card_cvv
        card_expiry             : $input.card_expiry
        cardholder_name         : $input.cardholder_name
        stripe_payment_intent_id: $intent.response.result.id
        status                  : "succeeded"
      }
    } as $payment
  }

  response = $payment
  guid = "BNAn_W_szr0DTgVUjmP5wcdQ1UM"
}