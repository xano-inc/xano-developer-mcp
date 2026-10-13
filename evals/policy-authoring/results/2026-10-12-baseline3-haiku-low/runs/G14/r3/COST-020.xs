policy "COST-020" {
  title = "External calls are not retried inside while loops"
  statement = "An outbound request (api.request) must not sit inside a while loop. A retry loop with no attempt cap can run forever and keep billing or hammering a vendor. Retry a bounded number of times with a for loop or a counter, or move the retry into a separate function with a stated limit. Changing a retry loop is a code change the owner approves."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost"]

  rule {
    check = "statement.containment"
    params = { statements: ["api.request"], must_not_be_inside: ["while"] }
  }
}
