policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests, cloud and email providers and AI model providers are limited to the vendors the policy owner approves. The approved host list is empty until the owner fills it, so every outbound destination is reported as not yet reviewed."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {hosts: []}
  }
}
