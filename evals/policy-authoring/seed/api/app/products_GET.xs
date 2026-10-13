// The org's products with their current prices.
query products verb=GET {
  api_group = "app"
  auth = "users"

  input {
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $auth.id
    } as $me
  
    db.query products {
      where = $db.products.org_id == $me.org_id
      return = {type: "list", paging: {page: 1, per_page: 100}}
    } as $products
  }

  response = $products
  guid = "F3kdN_AF1MPtAw6o0SP56V3JJF4"
}