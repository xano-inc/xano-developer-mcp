// Rejects a client that makes more than 60 requests in a minute, before the endpoint's stack runs.
middleware rate_limit {
  stack {
    var $client_key {
      value = $request.headers."x-forwarded-for"
    }

    db.query rate_limit_hits {
      where = $db.rate_limit_hits.client_key == $client_key && $db.rate_limit_hits.created_at > (now|subtract_seconds:60)
      return = {type: "count"}
    } as $recent_hits

    precondition ($recent_hits < 60) {
      error_type = "accessdenied"
      error = "Too many requests. Try again in a minute."
    }

    db.add rate_limit_hits {
      data = {client_key: $client_key}
    } as $hit
  }

  exception_policy = "rethrow"
}
