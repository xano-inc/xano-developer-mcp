// Refund requests raised by staff; a refund is paid out once it is approved.
table refunds {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int org_id {
      table = "orgs"
    }
  
    int payment_id {
      table = "payments"
    }
  
    decimal amount
    text reason?
    enum status?=requested {
      values = ["requested", "approved", "rejected", "paid"]
    }
  
    int requested_by? {
      table = "users"
    }
  
    int approved_by? {
      table = "users"
    }
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "Lid5E5RS7vdwRDL_IwLPuglvT9o"
}