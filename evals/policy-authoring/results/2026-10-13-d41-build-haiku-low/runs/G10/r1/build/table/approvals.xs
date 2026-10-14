// A human's approval of one action on one target, such as sending an email to a customer. require_approval reads it.
table approvals {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text action
    text target
    enum status?=requested {
      values = ["requested", "approved", "rejected"]
    }

    text requested_by?
    text approved_by?
  }

  index = [
    {type: "btree", field: [{name: "action"}, {name: "target"}]}
  ]
}
