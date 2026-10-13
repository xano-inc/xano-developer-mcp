// Limits how often one client address can call a public endpoint: 10 calls per minute for each endpoint. Past the limit the call is refused.
middleware rate_limit {
  stack {
    var $bucket_key {
      value = $request.ip ~ ":" ~ $request.path
    }

    db.query rate_limit_hits {
      where = $db.rate_limit_hits.bucket_key == $bucket_key && $db.rate_limit_hits.window_ends_at > now
      return = {type: "single"}
    } as $bucket

    conditional {
      if ($bucket == null) {
        db.add rate_limit_hits {
          data = {
            bucket_key    : $bucket_key
            hits          : 1
            window_ends_at: now|add_seconds:60
          }
        }
      }
      elseif ($bucket.hits >= 10) {
        precondition (false) {
          error_type = "accessdenied"
          error = "Too many requests. Wait a minute and try again."
        }
      }
      else {
        db.edit rate_limit_hits {
          field_name = "id"
          field_value = $bucket.id
          data = {hits: $bucket.hits + 1}
        }
      }
    }
  }
}
