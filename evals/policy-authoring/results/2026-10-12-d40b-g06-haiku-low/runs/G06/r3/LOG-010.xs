policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request sits inside a try block, so a vendor failure reaches error handling. This checks api.request calls only; a call that sits outside a try block is reported. An external call that is deliberately left unhandled needs its owner's sign-off before it is exempted."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = { statements: ["api.request"], must_be_inside: ["try_catch"] }
  }
}
