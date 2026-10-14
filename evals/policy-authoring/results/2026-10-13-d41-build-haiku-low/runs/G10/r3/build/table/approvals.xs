// A human's approval of an action an agent wants to take on a record.
table approvals {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text action
    int record_id
    text requested_by
    text approved_by?
    timestamp approved_at?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
