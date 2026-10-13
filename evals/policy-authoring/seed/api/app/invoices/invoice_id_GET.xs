// One invoice with its line items.
query "invoices/{invoice_id}" verb=GET {
  api_group = "app"
  auth = "users"

  input {
    int invoice_id
  }

  stack {
    db.get invoices {
      field_name = "id"
      field_value = $input.invoice_id
    } as $invoice
  
    db.query invoice_item {
      where = $db.invoice_item.invoice_id == $input.invoice_id
      return = {type: "list"}
    } as $items
  }

  response = {invoice: $invoice, items: $items}
  guid = "bxD3vJDnACSjYz6eIxFP0qMY0aQ"
}