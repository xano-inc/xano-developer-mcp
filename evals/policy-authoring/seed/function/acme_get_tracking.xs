// Fetches tracking for one shipment from the shipping vendor, with a fallback when the vendor is down.
function acme_get_tracking {
  input {
    text tracking_number
  }

  stack {
    try_catch {
      try {
        api.request {
          url = "https://api.shipfast.example/v2/track/" ~ $input.tracking_number
          method = "GET"
          headers = ["Authorization: Bearer " ~ $env.SHIPFAST_API_KEY]
          timeout = 60
        } as $tracking
      }
    
      catch {
        var $tracking {
          value = {response: {status: 503, result: null}}
        }
      }
    }
  }

  response = $tracking.response.result
  guid = "nkZfJLrrfKYBjhM0SkXApBf-LFw"
}