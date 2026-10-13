// Deployed tenant environments. Each belongs to one org; support staff manage them from the admin API.
table tenants {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int org_id {
      table = "orgs"
    }
  
    text name filters=trim
    text region?="us-east"
    text status?=active
    text db_connection_string?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "org_id", op: "asc"}]}
  ]

  guid = "H1x6zGrCP6BKHqiECs_GDXKO-Jc"
}