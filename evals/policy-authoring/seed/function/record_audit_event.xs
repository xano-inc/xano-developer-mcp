// Appends one row to audit_log: who changed which record of which table.
function record_audit_event {
  input {
    int actor_id?
    text action
    text table_name
    int record_id?
    json changes?
  }

  stack {
    db.add audit_log {
      data = {
        created_at: "now"
        actor_id  : $input.actor_id
        action    : $input.action
        table_name: $input.table_name
        record_id : $input.record_id
        changes   : $input.changes
      }
    } as $row
  }

  response = $row
  guid = "NGPSdcHn5ehccvGtENDm_jO-MK4"
}