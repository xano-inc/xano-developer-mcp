// Login sessions; expired ones are purged nightly.
table sessions {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user_id {
      table = "users"
    }
  
    timestamp expires_at
    text ip_address?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  tags = ["personal"]

  guid = "uuVqMevo2LCQDx36M046KfLjBzk"
}