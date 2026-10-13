// Updates a customer's contact details.
query "customers/{customer_id}" verb=PATCH {
  api_group = "app"
  auth = "users"

  input {
    int customer_id
    email email?
    text phone?
  }

  stack {
    db.patch customers {
      field_name = "id"
      field_value = $input.customer_id
      data = {email: $input.email, phone: $input.phone}
    } as $customer
  }

  response = $customer
  guid = "cxlhlCuruX7xUO2re_wXFySCgdM"
}