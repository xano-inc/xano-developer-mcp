policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request sits inside a try block, so a vendor failure reaches error handling, and that try block has a catch branch with at least one statement in it. Checks api.request and stream.from_request only; a request that cannot fail this way is exempted by the policy owner, never by an exemption tag added in code."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = {statements: ["api.request", "stream.from_request"], must_be_inside: ["try_catch"]}
  }

  rule {
    check = "statement.containment"
    params = {statements: ["try_catch"], must_contain: ["catch"], min_count: 1}
  }
}
