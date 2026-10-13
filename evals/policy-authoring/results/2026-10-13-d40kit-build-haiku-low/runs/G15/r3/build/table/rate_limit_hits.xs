// One row per request to a rate-limited endpoint; the rate_limit middleware counts recent rows.
table rate_limit_hits {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text ip_address
    text path
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
