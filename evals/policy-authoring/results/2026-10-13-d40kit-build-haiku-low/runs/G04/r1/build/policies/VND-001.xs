policy "VND-001" {
  title = "Data only goes to approved vendors"
  statement = "Outbound requests and AI model providers are limited to the vendors the owner approves. The approved list is empty until the owner adds vendors that may receive health data; every outbound call is reported until then."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "outbound.vendor_allowlist"
    params = {hosts: [], providers: []}
  }
}
