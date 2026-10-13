// An anonymous caller gets no invoices.
workflow_test invoices_require_login {
  stack {
    api.call invoices verb=GET {
      api_group = "app"
    } as $anonymous
  
    expect.to_not_be_defined ($anonymous.items)
  }

  tags = ["smoke"]
  guid = "maLiKJnXrsy8kpriLfrqJ4oNEM4"
}