// Refuses a client that sends more than 20 requests to one path in a minute. Runs before the endpoint's stack.
middleware rate_limit {
  stack {
    var $ip {
      value = $request.headers."x-forwarded-for" ?? "unknown"
    }

    db.add rate_limit_hits {
      data = {
        ip_address: $ip
        path      : $request.path
      }
    } as $hit

    db.query rate_limit_hits {
      where = $db.rate_limit_hits.ip_address == $ip && $db.rate_limit_hits.path == $request.path && $db.rate_limit_hits.created_at > (now - 60)
      return = {type: "count"}
    } as $recent

    precondition ($recent <= 20) {
      error_type = "accessdenied"
      error = "Too many requests. Try again in a minute."
    }
  }
}
