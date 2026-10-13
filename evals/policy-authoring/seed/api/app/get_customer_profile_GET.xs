// A customer's profile for the account page.
query getCustomerProfile verb=GET {
  api_group = "app"
  auth = "users"

  input {
    int customer_id
  }

  stack {
    db.get customers {
      field_name = "id"
      field_value = $input.customer_id
    } as $customer
  }

  response = $customer
  guid = "Qe5ErET_cth_teFdYDpx6LDpoIY"
}