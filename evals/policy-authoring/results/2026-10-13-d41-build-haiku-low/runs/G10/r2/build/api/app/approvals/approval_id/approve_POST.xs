// Approves an agent action so it can go ahead.
query "approvals/{approval_id}/approve" verb=POST {
  api_group = "app"
  auth = "users"

  input {
    int approval_id
  }

  stack {
    db.edit approvals {
      field_name = "id"
      field_value = $input.approval_id
      data = {approved_by: $auth.id, approved_at: now}
    } as $approval
  }

  response = $approval
}
