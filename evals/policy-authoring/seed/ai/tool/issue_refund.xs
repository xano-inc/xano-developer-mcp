// Refunds a payment once a person has approved it.
tool issue_refund {
  instructions = "Refund a payment. A person must approve it first: call without approval_id to request approval."

  input {
    // The payment to refund
    int payment_id
  
    // The approved request id, once a person has approved
    int approval_id?
  }

  stack {
    function.run request_human_approval {
      input = {
        action     : "refund"
        payload    : {payment_id: $input.payment_id}
        approval_id: $input.approval_id
      }
    } as $approval
  
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