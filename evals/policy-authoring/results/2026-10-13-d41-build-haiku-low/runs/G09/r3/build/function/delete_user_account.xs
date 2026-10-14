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

    db.bulk.delete support_tickets {
      where = $db.support_tickets.user_id == $input.user_id
    } as $tickets

    db.del users {
      field_name = "id"
      field_value = $input.user_id
    }
  }

  response = {deleted: true}
  tags = ["erasure"]
  guid = "iWtAL7j6O0pMpjKQBxol3qm35T8"
}