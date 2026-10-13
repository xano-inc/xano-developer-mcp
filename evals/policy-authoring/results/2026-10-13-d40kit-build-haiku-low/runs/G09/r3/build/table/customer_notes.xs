// Internal notes staff and the support agent keep about a customer.
table customer_notes {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int customer_id {
      table = "customers"
    }
  
    text note
    text author?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  tags = ["retained"]
  guid = "q7WQsqMJvHTdUMd5Y3I2ZY7-6Fg"
}