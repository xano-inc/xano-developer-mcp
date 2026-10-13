policy "AUTH-010" {
  title = "Endpoints that reach invoices require login"
  statement = "Every endpoint that reads or writes the invoices table must require a login. An invoice endpoint that is deliberately public (a hosted invoice view, say) carries the `public` tag, signed off by the platform owner. Authorization of what a logged-in caller can see is not checked by this policy."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.auth_required"
    params = {
      tables: ["invoices"]
      except_tags: ["public"]
    }
  }
}
