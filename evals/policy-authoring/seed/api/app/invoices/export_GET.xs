// CSV-style export of every invoice for the accountant. Added late one night "temporarily".
query "invoices/export" verb=GET {
  api_group = "app"

  input {
  }

  stack {
    db.query invoices {
      return = {type: "list"}
    } as $all
  }

  response = $all
  guid = "aoycgZQgW4xe5fANVIJise8kG1Y"
}