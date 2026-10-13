// Looks up an order's status.
tool lookup_order {
  instructions = "Use this to find the status and total of a customer's order by its id."

  input {
    // The order id the customer gave
    int order_id
  }

  stack {
    db.get orders {
      field_name = "id"
      field_value = $input.order_id
    } as $order
  }

  response = {status: $order.status, total: $order.total}
  guid = "rMoeZ30O-yKpOZgRu-c3OSQEn5w"
}