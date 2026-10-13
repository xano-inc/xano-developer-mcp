// Asks the shipping vendor for a rate quote for an order.
query "shipments/quote" verb=POST {
  api_group = "app"
  auth = "users"

  input {
    int order_id
    text postcode
  }

  stack {
    api.request {
      url = "https://api.shipfast.example/v2/quote"
      method = "POST"
      params = {order: $input.order_id, postcode: $input.postcode}
      headers = ["Authorization: Bearer " ~ $env.SHIPFAST_API_KEY]
    } as $quote
  }

  response = $quote.response.result
  guid = "N3jmX7W7w5SxLlOnhOUF0JWFMn0"
}