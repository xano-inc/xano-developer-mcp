// Outbound webhook deliveries that failed and wait for a retry.
table webhook_deliveries {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text url
    json payload?
    int attempts?
    text status?=failed
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  tags = ["retained"]
  guid = "YMy5ywm1I5oVatF1OFPQElRADc0"
}