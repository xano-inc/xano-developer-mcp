// Customer organisations. Every tenant-owned row carries an org_id pointing here.
table orgs {
  auth = false
  tags = ["customer-email"]

  schema {
    int id
    timestamp created_at?=now
    text name filters=trim
    text plan?=starter
    text billing_email?
    bool suspended?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "8jH1cm02vNSGwq_7V9QzQvb6Mhw"
}