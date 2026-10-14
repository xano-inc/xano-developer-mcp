// Deletes a user and the personal data that hangs off them. Called by DELETE /account.
function delete_user_account {
  input {
    int user_id
    text email
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

    db.bulk.delete newsletter_subscribers {
      where = $db.newsletter_subscribers.email == $input.email
    } as $subscriptions

    db.query orders {
      where = $db.orders.user_id == $input.user_id
      return = {type: "list"}
    } as $user_orders

    foreach ($user_orders) {
      each as $order {
        db.edit orders {
          field_name = "id"
          field_value = $order.id
          data = {user_id: null}
        } as $unlinked
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
