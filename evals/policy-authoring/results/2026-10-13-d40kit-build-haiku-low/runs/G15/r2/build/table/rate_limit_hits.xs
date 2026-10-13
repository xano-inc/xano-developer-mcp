// One row per request seen by the rate limiter; read to count recent requests per client.
table rate_limit_hits {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text client_key filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "client_key", op: "asc"}, {name: "created_at", op: "desc"}]}
  ]
}
