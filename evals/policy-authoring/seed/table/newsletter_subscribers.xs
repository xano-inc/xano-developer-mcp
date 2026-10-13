// Marketing newsletter sign-ups from the public site.
table newsletter_subscribers {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    email email filters=trim|lower
    text source?
    bool confirmed?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "j189RCXCaWsxB1lbKjPDDQ84D60"
}