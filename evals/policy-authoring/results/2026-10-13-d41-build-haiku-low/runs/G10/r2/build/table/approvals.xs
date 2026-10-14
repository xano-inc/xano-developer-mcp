// Actions a human must approve before an agent may carry them out.
table approvals {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text action
    int record_id?
    int requested_by?
    int approved_by? {
      table = "users"
    }

    timestamp approved_at?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
