// People who sign in. role is admin, support_lead, manager, staff, member or viewer; org_id is the tenant they belong to.
table users {
  auth = true
  tags = ["personal"]

  schema {
    int id
    timestamp created_at?=now
    text name filters=trim
    email email filters=trim|lower
    password password?
    enum role?=member {
      values = ["admin", "support_lead", "manager", "staff", "member", "viewer"]
    }
  
    int org_id? {
      table = "orgs"
    }
  
    text phone?
    timestamp last_login_at?
    bool marketing_opt_in?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "email", op: "asc"}]}
    {type: "btree", field: [{name: "org_id", op: "asc"}]}
  ]

  guid = "xU8Al0G-VGO1TKLY5LrNKIOkGUE"
}