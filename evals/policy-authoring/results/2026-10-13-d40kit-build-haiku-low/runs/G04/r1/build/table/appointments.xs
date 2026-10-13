// Patient appointments with a provider.
table appointments {
  auth = false

  schema {
    int id
    int patient_id {
      table = "patients"
    }
  
    text provider_name
    timestamp starts_at
    text reason?
    text status?=booked
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  tags = ["phi"]
  guid = "BzrPal7tO1x1hNGsRNgzRVQsOTg"
}