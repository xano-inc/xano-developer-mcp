// Emails an AI tool wants to send to a customer. A person must set status to approved before the send runs.
table email_approvals {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    email to
    text subject
    text body
    enum status?=pending {
      values = ["pending", "approved", "rejected", "sent"]
    }

    int approved_by? {
      table = "users"
    }
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
