// Limits each caller IP to 20 requests per minute before the endpoint runs. Past the limit the caller is refused, and the error is never swallowed.
middleware "rate_limit" {
  input {
  }

  stack {
    redis.ratelimit {
      key = $env.$remote_ip
      max = 20
      ttl = 60
    } as $ratelimit
  }

  exception = "critical"
  result_type = "merge"
}
