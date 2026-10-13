// Customer support conversations, summarised nightly by the AI summariser.
table support_tickets {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int org_id {
      table = "orgs"
    }
  
    int user_id? {
      table = "users"
    }
  
    email requester_email
    text subject
    text body
    text summary?
    text status?=open
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  tags = ["customer-email"]
  guid = "BOYHPB_-O75NDfyqlRdIIzUD2_w"
}