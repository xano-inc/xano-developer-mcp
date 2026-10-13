// Queues an email to a customer for support. A person approves it before it is sent.
tool send_customer_email {
  instructions = "Queue an email to the customer with the answer or next steps. The email is not sent until a person approves it, so tell the customer it is pending."

  input {
    // The customer's email address
    email to

    // Email subject line
    text subject

    // Email body in plain text
    text body
  }

  stack {
    db.add pending_actions {
      data = {
        action : "send_customer_email"
        payload: {to: $input.to, subject: $input.subject, body: $input.body}
      }
    } as $queued
  }

  response = {queued: true}
  guid = "CCzsw2M_uOR-T8psXFQa6b_WdHA"
}