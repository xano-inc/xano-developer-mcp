// Emails an invoice to its customer.
function acme_send_invoice_email {
  input {
    int invoice_id
  }

  stack {
    db.get invoices {
      field_name = "id"
      field_value = $input.invoice_id
    } as $invoice
  
    db.get customers {
      field_name = "id"
      field_value = $invoice.customer_id
    } as $customer
  
    util.send_email {
      api_key = $env.RESEND_API_KEY
      service_provider = "resend"
      subject = "Invoice " ~ $invoice.number
      message = "Your invoice total is " ~ $invoice.amount
      to = $customer.email
      from = "billing@acme.example"
    } as $sent
  }

  response = $sent
  guid = "pgPFgumlqqfwzMITjB2AwVGfd_M"
}