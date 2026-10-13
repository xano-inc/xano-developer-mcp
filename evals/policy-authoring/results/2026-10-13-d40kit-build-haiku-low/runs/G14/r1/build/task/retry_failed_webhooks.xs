// Re-sends failed webhook deliveries, at most 5 attempts per run. A delivery that still fails is marked retry_exhausted so later runs stop selecting it.
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

        for (5) {
          each as $attempt_no {
            conditional {
              if ($delivered == false) {
                api.request {
                  url = $delivery.url
                  method = "POST"
                  params = $delivery.payload
                } as $attempt

                conditional {
                  if ($attempt.response.status == 200) {
                    var.update $delivered {
                      value = true
                    }
                  }
                }
              }
            }
          }
        }

        conditional {
          if ($delivered) {
            db.edit webhook_deliveries {
              field_name = "id"
              field_value = $delivery.id
              data = {status: "delivered"}
            } as $done
          }
          else {
            db.edit webhook_deliveries {
              field_name = "id"
              field_value = $delivery.id
              data = {status: "retry_exhausted"}
            } as $gave_up
          }
        }
      }
    }
  }

  schedule = [{starts_on: 2026-01-01 00:00:00+0000, freq: 300}]
  guid = "xVlZD1UTTY6Qkl9YE0I31YR43FU"
}
