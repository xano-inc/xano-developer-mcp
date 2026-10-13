// Creates a customer record.
query customers verb=POST {
  api_group = "app"
  auth = "users"

  input {
    text full_name
    email email
    text phone?
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $auth.id
    } as $me
  
    db.add customers {
      data = {
        org_id   : $me.org_id
        full_name: $input.full_name
        email    : $input.email
        phone    : $input.phone
      }
    } as $customer
  }

  response = $customer
  guid = "9AnNrltVKxuY2lr0Qg8NBs459h4"
}