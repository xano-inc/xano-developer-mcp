// Actions the support agent proposed that wait for a person to approve them.
table approval_requests {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text action
    json payload?
    text status?=pending
    int reviewer_id?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "OqG0wBCObqh1NNLPYgGFUatuy9c"
}