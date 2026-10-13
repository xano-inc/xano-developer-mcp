policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request sits inside a try block, so a vendor failure reaches error handling instead of reaching the caller unhandled. Advisory: a finding lists an api.request outside a try block. It confirms the try block is there, not that the catch handles the failure."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    title = "Requests sit inside a try_catch"
    check = "statement.containment"
    params = { statements: ["api.request"], must_be_inside: ["try_catch"] }
  }
}
