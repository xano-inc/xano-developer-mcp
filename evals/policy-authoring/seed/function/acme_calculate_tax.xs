// Sales tax for an invoice total, by country.
function acme_calculate_tax {
  input {
    decimal amount
    text country
  }

  stack {
    var $rate {
      value = 0.2
    }
  
    conditional {
      if ($input.country == "US") {
        var.update $rate {
          value = 0.07
        }
      }
    }
  
    var $tax {
      value = $input.amount * $rate
    }
  }

  response = $tax
  guid = "ncHchCPWCoTaXykOQ5VnmbwbmZM"
}