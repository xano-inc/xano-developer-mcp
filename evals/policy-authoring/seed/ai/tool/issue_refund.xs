// Refunds a payment through Stripe.
tool issue_refund {
  instructions = "Refund a payment when the customer was charged in error."

  input {
    // The payment to refund
    int payment_id
  }

  stack {
    db.get payments {
      field_name = "id"
      field_value = $input.payment_id
    } as $payment
  
    api.request {
      url = "https://api.stripe.com/v1/refunds"
      method = "POST"
      params = {payment_intent: $payment.stripe_payment_intent_id}
      headers = ["Authorization: Bearer " ~ $env.STRIPE_SECRET_KEY]
      timeout = 20
    } as $refund
  }

  response = {refunded: true}
  guid = "0LVSXuT5e_J68rDMjk8YcK3YCRk"
}