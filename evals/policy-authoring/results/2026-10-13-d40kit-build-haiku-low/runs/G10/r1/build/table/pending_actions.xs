// Actions the AI agent asked for that a person must approve before they run.
table pending_actions {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text action
    json payload?
    text status?=pending
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}