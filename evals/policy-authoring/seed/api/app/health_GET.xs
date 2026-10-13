// Liveness probe for the load balancer. Public by design; returns no data.
query health verb=GET {
  api_group = "app"

  input {
  }

  stack {
    var $status {
      value = {ok: true}
    }
  }

  response = $status
  tags = ["public"]
  guid = "BFPVKT9xdSflHNXhLE11u0EfxsA"
}