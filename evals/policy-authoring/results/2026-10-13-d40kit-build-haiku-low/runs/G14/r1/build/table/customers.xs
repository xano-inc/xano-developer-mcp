// End customers of an org (the people invoices and emails go to).
table customers {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int org_id {
      table = "orgs"
    }
  
    text full_name filters=trim
    email email filters=trim|lower
    text phone?
    text shipping_address?
    date date_of_birth?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "email", op: "asc"}]}
  ]

  tags = ["customer-email"]
  guid = "WKqblBRNMCInJ6wZcd1FmbcGC4E"
}