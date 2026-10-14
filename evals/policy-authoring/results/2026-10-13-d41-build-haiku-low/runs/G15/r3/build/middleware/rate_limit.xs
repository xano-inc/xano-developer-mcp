// Limits how often one caller can reach an endpoint: 60 requests per minute per IP. Past the limit the caller gets an error. Attached as pre middleware to the app API group.
middleware rate_limit {
  input {
  }

  stack {
    redis.ratelimit {
      key = $env.$remote_ip
      max = 60
      ttl = 60
    } as $limit

    precondition ($limit.allowed) {
      error_type = "accessdenied"
      error = "Too many requests. Try again later."
    }
  }

  exception = "critical"
}
