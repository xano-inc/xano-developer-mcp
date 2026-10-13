// One row per action an AI agent wants to take on a customer. A person sets status to approved before the action runs.
table approval_requests {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text action
    text target
    text status?="pending"
    text decided_by?
    timestamp decided_at?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
