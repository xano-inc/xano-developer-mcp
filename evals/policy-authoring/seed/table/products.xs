// The shop's catalogue. Staff see every product; price changes go live at once.
table products {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int org_id {
      table = "orgs"
    }
  
    text sku filters=trim
    text name filters=trim
    decimal price
    text currency?=usd
    bool active?=true
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "jF9_Cubrsmvd2FBwNqlCvCumGWU"
}