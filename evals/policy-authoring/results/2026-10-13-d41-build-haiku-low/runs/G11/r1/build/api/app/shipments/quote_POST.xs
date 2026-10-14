// Asks the shipping vendor for a rate quote for an order.
query "shipments/quote" verb=POST {
  api_group = "app"
  auth = "users"

  input {
    int order_id
    text postcode
  }

  stack {
    try_catch {
      try {
        api.request {
          url = "https://api.shipfast.example/v2/quote"
          method = "POST"
          params = {order: $input.order_id, postcode: $input.postcode}
          headers = ["Authorization: Bearer " ~ $env.SHIPFAST_API_KEY]
          timeout = 30
        } as $quote
      }

      catch {
        throw {
          name = "shipping_vendor_unavailable"
          value = "The shipping vendor did not respond. No quote is available right now."
        }
      }
    }
  }

  response = $quote.response.result
  guid = "N3jmX7W7w5SxLlOnhOUF0JWFMn0"
}