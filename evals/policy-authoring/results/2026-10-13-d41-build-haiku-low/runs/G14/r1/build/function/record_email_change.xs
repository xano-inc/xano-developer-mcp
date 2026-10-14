// Writes one email_change_log row for a change to a customer-email record. Called by every object that writes such a table.
function record_email_change {
  input {
    text table_name
    int record_id
    text action
    text note?
  }

  stack {
    db.add email_change_log {
      data = {
        actor_id  : $auth.id
        table_name: $input.table_name
        record_id : $input.record_id
        action    : $input.action
        note      : $input.note
      }
    } as $entry
  }

  response = $entry
  guid = "rEc8dL3nQp6vXw1mTu5KbYa2sGh"
}
