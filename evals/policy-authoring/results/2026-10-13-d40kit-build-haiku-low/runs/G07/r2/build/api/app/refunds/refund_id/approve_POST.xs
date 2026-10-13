// Approves a refund request so it can be paid out.
query "refunds/{refund_id}/approve" verb=POST {
  api_group = "app"
  auth = "users"

  input {
    int refund_id
  }

  stack {
    db.edit refunds {
      field_name = "id"
      field_value = $input.refund_id
      data = {status: "approved", approved_by: $auth.id}
    } as $refund

    function.run record_audit_event {
      input = {
        actor_id: $auth.id,
        action: "approve",
        table_name: "refunds",
        record_id: $input.refund_id
      }
    } as $audit
  }

  response = $refund
  guid = "wFTfZrX0Y6sr1TXTqk_5nVktMk8"
}