---
applyTo: "tasks/*.xs"
---

# Xanoscript Task Examples

Below are some examples of tasks defined in Xanoscript.

## deactivate_user_profile_task

```xs
task "deactivate_inactive_profiles" {
  description = "Deactivate user profiles for users who have not had session activity in the past 30 days. This task runs monthly."
  stack {
    var $current_time {
      value = now
      description = "Get the current timestamp for comparison"
    }

    var $threshold_time {
      value = $current_time - (30 * 86400 * 1000)
      description = "Calculate the timestamp for 30 days ago"
    }

    db.query "sessions" {
      description = "Find users with no session activity in the past 30 days"
      where = $db.sessions.last_activity < $threshold_time
      output = ["id", "user_id", "is_active"]
    } as $inactive_users

    foreach ($inactive_users) {
      each as $user {
        db.edit "user_profile" {
          field_name = "id"
          field_value = $user.user_id
          data = {is_active: false}
          description = "Deactivate user profile"
        } as $user_profile

        debug.log {
          value = "Deactivated user profile with ID: " ~ $var.user_profileuser.user_id
          description = "Log individual profile deactivation"
        }
      }
    }

    debug.log {
      value = "Profile deactivation task completed. Total profiles deactivated: " ~ $inactive_users|count
      description = "Log successful task completion"
    }
  }

  schedule = [{starts_on: 2025-07-01 00:00:00+0000, freq: 2592000}]

  history = "inherit"
}
```

## cleanup_expired_sessions_task

```xs
task "cleanup_expired_sessions" {
  description = "Clean up expired sessions from the sessions table every 6 hours starting Feb 1, 2026. This task deletes expired sessions and logs the number of deletions for monitoring purposes."
  stack {
    var $current_time {
      value = now
      description = "Get the current timestamp for comparison"
    }

    db.query "sessions" {
      description = "Count expired sessions before deletion"
      where = $db.sessions.expires_at < $current_time && $db.sessions.is_active
    } as $expired_sessions

    var $expired_count {
      value = $expired_sessions|count
      description = "Count of expired sessions to be deleted"
    }

    var $total_deletions {
      value = 0
      description = "Track the total number of sessions deleted"
    }

    debug.log {
      value = "Found " ~ $expired_count ~ " expired sessions for cleanup"
      description = "Log count of sessions found for deletion"
    }

    foreach ($expired_sessions) {
      each as $session {
        db.del sessions {
          field_name = "id"
          field_value = $session.id
          description = "Delete expired session"
        }

        math.add $total_deletions {
          value = 1
          description = "Increment deletion counter"
        }

        debug.log {
          value = "Deleted session with ID: " ~ $session.id
          description = "Log individual session deletion"
        }
      }
    }

    debug.log {
      value = "Session cleanup completed. Total sessions deleted: " ~ $total_deletions
      description = "Log successful cleanup completion"
    }
  }

  schedule = [{starts_on: 2026-02-01 00:00:00+0000, freq: 21600}]

  history = 1000
}
```

## slack_prompts_gif_finder

```xs
task "slack_prompts_gif_finder" {
  description = "Find and populate GIF URLs for Slack prompts using AI completion"
  stack {
    debug.log {
      value = "Starting GIF URL population task"
      description = "Log task start"
    }

    db.query "slack_prompts" {
      description = "Retrieve prompts that are missing a GIF URL"
      where = $db.slack_prompts.gif_url == "" && $db.slack_prompts.prompt != ""
    } as $prompts_without_gifs

    debug.log {
      value = {
        count: ($prompts_without_gifs|count)
      }

      description = "Log prompts found"
    }

    conditional {
      description = "Process if prompts exist"
      if (($prompts_without_gifs|count) > 0) {
        var $processed {
          value = 0
        }

        foreach ($prompts_without_gifs) {
          each as $prompt {
            util.template_engine {
              value = """
                Based on the following Slack message, suggest a single search query of 2-3 words for finding a funny GIF on Giphy. Your response should *ONLY* include the search term. Do not included any other explanation in your response.

                Message:
                {{$prompt.prompt}}
                """

              description = "Gemini Prompt"
            } as $ai_request

            var $search_term {
              value = "cute dog"
              description = "Set the fallback search term"
            }

            try_catch {
              description = "Get AI suggestion"
              try {
                function.run "ai/Gemini: Simple Chat Completion" {
                  description = "Use Gemini to convert the Slack prompt into a search term for Giphy"
                  input = {model: "gemini-2.5-flash", message: $ai_request}
                } as $ai_result

                var.update $search_term {
                  value = $ai_result
                }
              }

              catch {
                debug.log {
                  value = "AI request failed, using fallback"
                  description = "Log AI failure"
                  errorCode = $error.code
                  errorMessage = $error.message
                }
              }
            }

            try_catch {
              description = "Search Giphy"
              try {
                api.request {
                  url = "https://api.giphy.com/v1/gifs/search"
                  method = "GET"
                  params = {
                    api_key: $env.giphy_key
                    q: $search_term
                    limit: 1
                    rating: "g"
                  }

                  verify_host = false
                  verify_peer = false
                  description = "Giphy search"
                } as $gif_result

                var.update $gif_result {
                  value = $gif_result.response.result
                }

                conditional {
                  description = "Update if GIF found"
                  if (($gif_result.data|count) > 0) {
                    var $gif_url {
                      value = ($gif_result.data|first).images.original.url
                    }

                    db.edit "slack_prompts" {
                      field_name = "id"
                      field_value = $prompt.id
                      data = {gif_url: $gif_url}
                      description = "Update the GIF URL and updated_at for the prompt"
                    } as $updated_record

                    debug.log {
                      value = {
                        id: $var.updated_record.id
                        gif_url: $var.updated_record.gif_url
                      }

                      description = "GIF URL added"
                    }
                  }
                }
              }

              catch {
                debug.log {
                  value = {
                    id: $var.updated_record.id
                    error: "Giphy search failed"
                    errorCode = $error.code
                    errorMessage = $error.message
                  }

                  description = "Giphy error"
                }
              }
            }

            var.update $processed {
              value = $var.processed + 1
              description = "Increment the processed counter"
            }
          }
        }

        debug.log {
          value = {
            processed: $var.processed
          }

          description = "Processing complete"
        }
      }

      else {
        debug.log {
          value = "No prompts need GIFs"
          description = "Nothing to process"
        }
      }
    }

    debug.log {
      value = "Task completed"
      description = "Task end"
    }
  }

  schedule = [{starts_on: 2026-01-14 09:00:00+0000, freq: 86400}]

  history = "inherit"
}
```

## scheduled_end_of_month_task

```xs
task "end_of_month_task" {
  stack {
    var $timezone {
      value = "UTC"
      description = "Set Timezone"
    }

    var $now {
      value = now
    }

    var $today {
      value = $now|format_timestamp:"Y-m-d":$timezone
      description = "Today"
    }

    var $end_of_month {
      value = $now|transform_timestamp:"last day of this month":$timezone|format_timestamp:"Y-m-d":$timezone
      description = "Last day of this month"
    }

    conditional {
      description = "If Today is NOT the last day of the month, stop running"
      if ($today != $end_of_month) {
        return {
          value = "Today is not the last day of the month. Stop running."
        }
      }
    }

    debug.log {
      value = "It's the end of the month... executing task..."
      description = "Beginning of end of month task"
    }
  }

  schedule = [{starts_on: 2026-05-01 23:00:00+0000, freq: 86400}]

  history = "all"
}
```

## subscription_renewal_reminder_task

```xs
task "subscription_renewal_reminder" {
  stack {
    var $current_time {
      value = now
      description = "Current timestamp for calculations"
    }

    debug.log {
      value = "Starting subscription renewal reminder task"
      description = "Log task start"
    }

    db.query "subscription" {
      description = "Query subscriptions expiring in next 7 days"
      where = $db.subscription.status == "active" && $db.subscription.end_date > $current_time && $db.subscription.end_date <= ($current_time + 604800000)
    } as $expiring_subscriptions

    foreach ($expiring_subscriptions) {
      each as $subscription {
        db.query "user" {
          description = "Get user details"
          where = $db.user.id == $subscription.user_id
        } as $user_result

        conditional {
          description = "Process if user found"
          if (($user_result|count) > 0) {
            var $user {
              value = $user_result|first
              description = "Extract user from result"
            }

            api.request {
              url = "https://mandrillapp.com/api/1.0/messages/send"
              method = "POST"
              params = {}|set:"key":$env.mandrill_api_key|set:"message":({}|set:"from_email":"noreply@example.com"|set:"subject":"Subscription Reminder"|set:"text":"Your subscription expires soon"|set:"to":([]|push:({}|set:"email":$user.email|set:"type":"to")))
              headers = []|push:"Content-Type: application/json"
              description = "Send email reminder"
            } as $email_response

            db.add notification_log {
              data = {
                created_at       : $current_time
                user_id          : $user.id
                notification_type: "subscription_renewal_reminder"
                title            : "Subscription Reminder"
                message          : "Reminder sent successfully"
              }

              description = "Log notification"
            } as $log_entry
          }
        }
      }
    }

    debug.log {
      value = "Task completed"
      description = "Log completion"
    }
  }

  schedule = [{starts_on: 2026-01-01 09:00:00+0000, freq: 86400}]

  history = "all"
}
```

## low_stock_alert

```xs
task "low_stock_alert" {
  stack {
    db.query "product" {
      description = "Fetch products with stock quantity below 10"
      where = $db.product.stock_quantity < 10
    } as $low_stock_products

    var $alert_count {
      value = 0
      description = "Counter for alerted products"
    }

    foreach ($low_stock_products) {
      each as $product {
        api.realtime_event {
          channel = "stock_channel"
          data = {product_id: $product.id, stock_quantity: $product.stock_quantity}
          auth_table = "user"
          auth_id = "123"
          description = "Send real-time notification for low stock product"
        }

        math.add $alert_count {
          value = 1
          description = "Increment alert count"
        }
      }
    }

    debug.log {
      value = $alert_count
      description = "Log the number of alerted products"
    }
  }

  schedule = [{starts_on: 2026-01-01 09:00:00+0000, freq: 86400}]

  history = "inherit"
}
```

## daily_sales_report_task

```xs
task "daily_sales_report" {
  description = "Daily at 11 PM UTC generate a sales report by querying all payment transactions from the past 24 hours and calculating the total sales amount and transaction count. The task automatically executes every day starting from May 1, 2026, providing a summary of daily sales performance."
  stack {
    var $twenty_four_hours_ago {
      value = (now|transform_timestamp:"24 hours ago":"UTC")
      description = "Calculate timestamp for 24 hours ago"
    }

    db.query "payment_transactions" {
      description = "Get all transactions from the past 24 hours"
      where = $db.payment_transactions.transaction_date >= $twenty_four_hours_ago
    } as $daily_sales

    var $transaction_count {
      value = $daily_sales|count
      description = "Count number of transactions"
    }

    var $total_sales {
      value = ($daily_sales[$$].amount)|sum
      description = "Initialize total sales amount"
    }

    var $report_date {
      value = now
      description = "Current timestamp for the report"
    }

    db.transaction {
      description = "Store daily sales report with data consistency"
      stack {
        db.add reports {
          data = {
            report_type      : "daily_sales"
            report_date      : $report_date
            total_sales      : $total_sales
            transaction_count: $transaction_count
            period_start     : $twenty_four_hours_ago
            period_end       : $report_date
          }

          description = "Insert daily sales report into reports table"
        } as $report_result

        debug.log {
          value = "Daily sales report generated successfully"
          description = "Log successful report generation"
        }
      }
    }
  }

  schedule = [{starts_on: 2026-05-01 23:00:00+0000, freq: 86400}]

  history = "inherit"
}
```
