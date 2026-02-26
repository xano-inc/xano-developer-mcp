---
applyTo: ""
---

# Math & Object Functions

Statement-level math and object functions for XanoScript.

## Quick Reference

### Math Filters

| Filter | Example | Result |
|--------|---------|--------|
| `add` | `10\|add:5` | `15` |
| `subtract` | `10\|subtract:3` | `7` |
| `multiply` | `10\|multiply:2` | `20` |
| `divide` | `10\|divide:2` | `5` |
| `modulus` | `10\|modulus:3` | `1` |
| `floor` | `2.7\|floor` | `2` |
| `ceil` | `2.3\|ceil` | `3` |
| `round` | `2.567\|round:2` | `2.57` |
| `abs` | `-5\|abs` | `5` |
| `sqrt` | `9\|sqrt` | `3` |
| `pow` | `2\|pow:3` | `8` |
| `min` | `5\|min:3` | `3` |
| `max` | `5\|max:10` | `10` |

### Trigonometry

```xs
90|deg2rad                                   // 1.5707963...
1.5707963|rad2deg                            // 90
0|sin                                        // 0
0|cos                                        // 1
0.785398|tan                                 // ~1 (45 degrees)
0|asin                                       // 0
1|acos                                       // 0
1|atan                                       // 0.785398...
0|sinh                                       // 0
0|cosh                                       // 1
0|tanh                                       // 0
```

## Math Functions (Statement-Level)

Statement-level functions for arithmetic and bitwise operations. These mutate the target variable directly.

> **Note:** These are different from math filters (e.g., `$x|add:5`) and math domain functions (e.g., `math.add(5, 3)`). Statement-level math functions modify the variable in place.

### math.add / math.sub

```xs
math.add $cart_total { value = $item_price }
math.sub $total_cost { value = $discount_amount }
```

### math.mul / math.div

```xs
math.mul $base_price { value = $tax_rate }
math.div $total_time { value = $num_tasks }
```

### math.bitwise.and / math.bitwise.or / math.bitwise.xor

```xs
math.bitwise.and $status_flags { value = $check_bit }
math.bitwise.or $permissions { value = $new_permission }
math.bitwise.xor $flags { value = $toggle_bit }
```

### Math Domain Functions

```xs
math.add(5, 3)                               // 8
math.sub(10, 4)                              // 6
math.mul(3, 4)                               // 12
math.div(20, 5)                              // 4
math.mod(10, 3)                              // 1
```

### Bitwise Filters

```xs
5|bitwise_and:3                              // 1
5|bitwise_or:3                               // 7
5|bitwise_xor:3                              // 6
5|bitwise_not                                // -6
```

### Logical NOT Filter

```xs
true|not                                     // false
false|not                                    // true
$condition|not                               // Inverts boolean
```

## Object Functions (Statement-Level)

Statement-level functions for extracting object properties. These return results via the `as` variable.

### object.keys / object.values / object.entries

```xs
object.keys {
  value = $user_data
} as $user_data_keys

object.values {
  value = $product_info
} as $product_values

object.entries {
  value = $settings
} as $settings_pairs
```

### Object Domain Functions

```xs
object.keys({a: 1, b: 2})                    // ["a", "b"]
object.values({a: 1, b: 2})                  // [1, 2]
object.entries({a: 1, b: 2})                 // [{key: "a", value: 1}, {key: "b", value: 2}]
```

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `syntax` | Core operators, conditionals, type filters, error handling |
| `syntax/string-filters` | String filters, encoding, and security filters |
| `syntax/array-filters` | Array filters and array functions |
