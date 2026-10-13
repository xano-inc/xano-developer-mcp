// The signed-in user's org's invoices, a page at a time.
query invoices verb=GET {
  api_group = "app"
  auth = "users"

  input {
    int page?=1
    int per_page?=25
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $auth.id
    } as $me
  
    db.query invoices {
      where = $db.invoices.org_id == $me.org_id
      sort = {invoices.created_at: "desc"}
      return = {
        type  : "list"
        paging: {page: $input.page, per_page: $input.per_page}
      }
    } as $invoices
  }

  response = $invoices
  guid = "V9L7Nx_sfsvyJu9n7xfc4TQ4Eos"
}