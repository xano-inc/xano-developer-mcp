// Updates a customer's contact details and records the change.
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
  
    function.run record_audit_event {
      input = {
        actor_id  : $auth.id
        action    : "update"
        table_name: "customers"
        record_id : $input.customer_id
        changes   : {email: $input.email, phone: $input.phone}
      }
    } as $audit
  }

  response = $customer
  guid = "cxlhlCuruX7xUO2re_wXFySCgdM"
}