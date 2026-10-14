// Patient appointments with a provider.
table appointments {
  auth = false
  tags = ["phi"]

  schema {
    int id
    int patient_id {
      table = "patients"
    }
  
    text provider_name
    timestamp starts_at
    text reason? {sensitive = true}
    text status?=booked
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "BzrPal7tO1x1hNGsRNgzRVQsOTg"
}
