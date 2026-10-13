// Re-sends failed webhook deliveries until they go through.
task retry_failed_webhooks {
  stack {
    db.query webhook_deliveries {
      where = $db.webhook_deliveries.status == "failed"
      return = {type: "list"}
    } as $failed
  
    foreach ($failed) {
      each as $delivery {
        var $delivered {
          value = false
        }
      
        while ($delivered == false) {
          each {
            try_catch {
              try {
                api.request {
                  url = $delivery.url
                  method = "POST"
                  params = $delivery.payload
                } as $attempt
              }

              catch {
                debug.log {
                  value = "Webhook attempt failed for delivery " ~ $delivery.id
                }

                var $attempt {
                  value = {response: {status: 503}}
                }
              }
            }

            conditional {
              if ($attempt.response.status == 200) {
                var.update $delivered {
                  value = true
                }
              }
            }
          }
        }
      
        db.edit webhook_deliveries {
          field_name = "id"
          field_value = $delivery.id
          data = {status: "delivered"}
        } as $done
      }
    }
  }

  schedule = [{starts_on: 2026-01-01 00:00:00+0000, freq: 300}]
  guid = "xVlZD1UTTY6Qkl9YE0I31YR43FU"
}