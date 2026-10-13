// Saved postal addresses of users.
table user_address {
  auth = false

  schema {
    int id
    int user_id {
      table = "users"
    }
  
    text line1
    text line2?
    text city
    text postcode
    text country
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  tags = ["personal"]

  guid = "yG7Wa2mH-Ofb57UmPidQ1UWjMYM"
}