// Orders placed by customers.
table orders {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int org_id {
      table = "orgs"
    }
  
    int customer_id {
      table = "customers"
    }
  
    int user_id? {
      table = "users"
    }
  
    text status?=placed
    decimal total
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  tags = ["personal", "retained"]
  guid = "v2aQ5cSL0t7ukef8Xcqs6hxtuBU"
}