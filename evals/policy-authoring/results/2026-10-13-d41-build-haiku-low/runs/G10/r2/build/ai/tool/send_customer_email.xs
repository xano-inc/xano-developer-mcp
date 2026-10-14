// Emails a customer on behalf of support.
tool send_customer_email {
  instructions = "Send the customer an email with the answer or next steps."

  input {
    // The customer's email address
    email to
  
    // Email subject line
    text subject
  
    // Email body in plain text
    text body

    // The approved request that allows this email
    int approval_id
  }

  stack {
    function.run require_approval {
      input = {approval_id: $input.approval_id, action: "send_customer_email"}
    } as $approved

    util.send_email {
      api_key = $env.RESEND_API_KEY
      service_provider = "resend"
      subject = $input.subject
      message = $input.body
      to = $input.to
      from = "support@acme.example"
    } as $sent
  }

  response = {sent: true}
  guid = "CCzsw2M_uOR-T8psXFQa6b_WdHA"
}