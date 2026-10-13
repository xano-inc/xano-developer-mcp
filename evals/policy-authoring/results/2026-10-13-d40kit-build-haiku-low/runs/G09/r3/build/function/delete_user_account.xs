// Deletes a user and the personal data that hangs off them. Called by DELETE /account.
// Erases the user's own records and anonymises business records that point to them.
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
  
    db.query orders {
      where = $db.orders.user_id == $input.user_id
      return = {type: "list"}
    } as $orders_rows
  
    foreach ($orders_rows) {
      each as $row {
        db.patch orders {
          field_name = "id"
          field_value = $row.id
          data = {user_id: null}
        } as $orders_done
      }
    }
  
    db.query refunds {
      where = $db.refunds.requested_by == $input.user_id
      return = {type: "list"}
    } as $refunds_requested_rows
  
    foreach ($refunds_requested_rows) {
      each as $row {
        db.patch refunds {
          field_name = "id"
          field_value = $row.id
          data = {requested_by: null}
        } as $refunds_requested_done
      }
    }
  
    db.query refunds {
      where = $db.refunds.approved_by == $input.user_id
      return = {type: "list"}
    } as $refunds_approved_rows
  
    foreach ($refunds_approved_rows) {
      each as $row {
        db.patch refunds {
          field_name = "id"
          field_value = $row.id
          data = {approved_by: null}
        } as $refunds_approved_done
      }
    }
  
    db.del users {
      field_name = "id"
      field_value = $input.user_id
    }
  }

  response = {deleted: true}
  tags = ["erasure"]
  guid = "iWtAL7j6O0pMpjKQBxol3qm35T8"
}
