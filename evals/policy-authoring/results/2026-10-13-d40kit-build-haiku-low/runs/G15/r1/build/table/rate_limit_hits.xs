// Request counts per client address and endpoint for each one-minute window; read by the rate_limit middleware.
table rate_limit_hits {
  auth = false

  schema {
    int id
    text bucket_key
    int hits?=0
    timestamp window_ends_at
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
