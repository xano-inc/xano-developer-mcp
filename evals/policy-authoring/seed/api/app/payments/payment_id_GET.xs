// One payment, for the receipt page.
query "payments/{payment_id}" verb=GET {
  api_group = "app"
  auth = "users"

  input {
    int payment_id
  }

  stack {
    db.get payments {
      field_name = "id"
      field_value = $input.payment_id
    } as $payment
  }

  response = $payment
  guid = "uiCgnKSWxFQDFqeZdNuft2YUN98"
}