---
applyTo: "tasks/*.xs"
---

# How to Define Tasks in XanoScript

A **task** in XanoScript is a scheduled job that automates operations at specific times or intervals. Tasks are created in the `tasks` folder and are ideal for recurring jobs like data cleanup, report generation, or sending notifications.

## Task Structure

A task file consists of:

- The task name (e.g., `daily_report`, `cleanup_expired_sessions`)
- An optional `description` field
- A `stack` block containing the logic to execute
- A `schedule` block specifying when the task runs

## Example Task

The following task would be stored in `tasks/daily_sales_report.xs`

```xs
task "daily_sales_report" {
  description = "Generate a daily sales report at 11 PM UTC"
  stack {
    db.query "payment_transactions" {
      description = "Get all transactions from the past 24 hours"
      where = $db.payment_transactions.transaction_date >= (now|transform_timestamp:"24 hours ago":"UTC")
    } as $daily_sales

    var $transaction_count {
      value = $daily_sales|count
      description = "Count number of transactions"
    }

    var $total_sales {
      value = ($daily_sales[$$].amount)|sum
      description = "Calculate total sales amount"
    }

    db.add reports {
      data = {
        report_type      : "daily_sales"
        report_date      : now
        total_sales      : $total_sales
        transaction_count: $transaction_count
      }
      description = "Insert daily sales report"
    } as $report_result

    debug.log {
      value = "Daily sales report generated"
      description = "Log report generation"
    }
  }

  schedule = [{starts_on: 2026-05-01 23:00:00+0000, freq: 86400}]
}
```

## Stack Block

The `stack` block contains the sequence of actions to perform, such as:

- Database queries (`db.query`, `db.add`, `db.edit`, `db.patch` etc.)
- Variable declarations (`var`)
- Control flow (`foreach`, `conditional`)
- Logging (`debug.log`)
- API calls (`api.request`)

## Schedule Block

The `schedule` block defines when the task runs. It uses an `events` array with:

- `starts_on`: Start date and time (e.g., `2026-05-01 23:00:00+0000`)
- `freq`: Frequency in seconds (e.g., `86400` for daily)
- `ends_on`: Optional end date

**Example:**

```xs
schedule {
  events = [
    {starts_on: 2026-05-01 23:00:00+0000, freq: 86400}
  ]
}
```

## Best Practices

- Use `description` fields to document the purpose of your task and each block.
- Place all logic inside the `stack` block.
- Use the `schedule` block to automate execution.
- Use logging (`debug.log`) to track task execution and outcomes.

## Summary

- Place tasks in the `tasks` folder.
- Use the `stack` block for job logic.
- Use the `schedule` block for timing.
- Document your task with `description` fields.

For more examples, see the documentation or sample tasks in your
