// The org's refund requests, for staff.
query refunds verb=GET {
  api_group = "app"
  auth = "users"

  input {
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $auth.id
    } as $me
  
    db.query refunds {
      where = $db.refunds.org_id == $me.org_id
      sort = {refunds.created_at: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 50}}
    } as $refunds
  }

  response = $refunds
  guid = "HACM7hgMY36IzjvGVRg1y7Cmp4o"
}