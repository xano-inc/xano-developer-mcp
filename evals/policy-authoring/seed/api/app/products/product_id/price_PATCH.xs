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
  }

  response = $product
  guid = "YTPlLDKVksaRvDWCFo2ZkQuh7Og"
}