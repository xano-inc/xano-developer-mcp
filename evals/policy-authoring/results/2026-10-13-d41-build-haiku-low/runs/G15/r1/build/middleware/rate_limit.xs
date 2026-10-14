// Limits how often one caller can hit an endpoint. Keyed by IP before login, by user after.
middleware rate_limit {
  stack {
    redis.ratelimit {
      key = ($auth.id ? $auth.id : $env.$remote_ip)
      max = 10
      ttl = 60
      error = "Too many requests. Try again shortly."
    } as $limit
  }

  exception_policy = "critical"
}
