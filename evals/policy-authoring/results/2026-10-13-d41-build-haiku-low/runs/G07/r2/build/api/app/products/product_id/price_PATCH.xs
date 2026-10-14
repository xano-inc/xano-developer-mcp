// Changes a product's price.
query "products/{product_id}/price" verb=PATCH {
  api_group = "app"
  auth = "users"

  input {
    int product_id
    decimal price
  }

  stack {
    db.patch products {
      field_name = "id"
      field_value = $input.product_id
      data = {price: $input.price}
    } as $product

    function.run record_audit_event {
      input = {user_id: $auth.id, table_name: "products", record_id: $input.product_id, action: "patch"}
    } as $audit
  }

  response = $product
  guid = "YTPlLDKVksaRvDWCFo2ZkQuh7Og"
}