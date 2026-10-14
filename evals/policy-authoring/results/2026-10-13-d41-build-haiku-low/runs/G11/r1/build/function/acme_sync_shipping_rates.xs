// Pulls carrier rate cards and rewrites the cached rates. Grew over time; nobody wants to touch it.
function acme_sync_shipping_rates {
  input {
    text region?
    bool dry_run?
  }

  stack {
    var $carriers {
      value = ["ups", "fedex", "dhl"]
    }
  
    var $updated {
      value = 0
    }
  
    var $skipped {
      value = 0
    }
  
    var $legacy_mode {
      value = true
    }
  
    foreach ($carriers) {
      each as $carrier {
        try_catch {
          try {
            api.request {
              url = "https://api.shipfast.example/v2/rates/" ~ $carrier
              method = "GET"
              headers = ["Authorization: Bearer " ~ $env.SHIPFAST_API_KEY]
              timeout = 30
            } as $rates
          }

          catch {
            var $rates {
              value = {response: {status: 503, result: null}}
            }
          }
        }

        conditional {
          if ($rates.response.status == 200) {
            foreach ($rates.response.result.zones) {
              each as $zone {
                conditional {
                  if ($zone.active) {
                    db.query shipments {
                      where = $db.shipments.carrier == $carrier
                      return = {type: "list"}
                    } as $existing
                  
                    foreach ($existing) {
                      each as $shipment {
                        db.edit shipments {
                          field_name = "id"
                          field_value = $shipment.id
                          data = {last_tracking: $zone}
                        } as $edited
                      
                        math.add $updated {
                          value = 1
                        }
                      }
                    }
                  }
                
                  else {
                    math.add $skipped {
                      value = 1
                    }
                  }
                }
              }
            }
          }
        }
      
        !debug.log {
          value = $rates
        }
      }
    }
  
    debug.log {
      value = "Updated " ~ $updated ~ " shipments"
    }
  }

  response = {updated: $updated}
  guid = "hmGDQknujfWHAIGAkfuumqTQqng"
}