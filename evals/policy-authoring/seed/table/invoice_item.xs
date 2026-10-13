// Line items on an invoice.
table invoice_item {
  auth = false

  schema {
    int id
    int invoice_id {
      table = "invoices"
    }
  
    text description
    int quantity?=1
    decimal unit_price
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "YgXqlVZpHL-iZTgiCC_VsOUr0e8"
}