// Invoices issued to customers.
table invoices {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int org_id {
      table = "orgs"
    }
  
    int customer_id? {
      table = "customers"
    }
  
    text number filters=trim
    decimal amount
    text currency?=usd
    text status?=draft
    date due_on?
    text billing_address?
    text tax_id?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "org_id", op: "asc"}]}
  ]

  guid = "OsP6qnB8jNBP9-wNlNd0ZbsBSAU"
}