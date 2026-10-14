// Deletes a user and the personal data that hangs off them. Called by DELETE /account.
function delete_user_account {
  input {
    int user_id
  }

  stack {
    db.bulk.delete user_address {
      where = $db.user_address.user_id == $input.user_id
    } as $addresses
  
    db.bulk.delete sessions {
      where = $db.sessions.user_id == $input.user_id
    } as $sessions
  
    db.del users {
      field_name = "id"
      field_value = $input.user_id
    }

    function.run record_audit_event {
      input = {
        table_name: "users"
        record_id : $input.user_id
        action    : "delete"
        actor_id  : $input.user_id
      }
    } as $audit
  }

  response = {deleted: true}
  guid = "iWtAL7j6O0pMpjKQBxol3qm35T8"
}