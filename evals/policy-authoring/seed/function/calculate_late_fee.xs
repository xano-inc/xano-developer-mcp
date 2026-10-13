// Late fee for an overdue invoice.
function calculateLateFee {
  input {
    decimal amount
    int days_late
  }

  stack {
    var $fee {
      value = $input.amount * 0.015 * ($input.days_late / 30)
    }
  }

  response = $fee
  guid = "0BSKmEwwl81V7wDWvfyvkAv_mv8"
}