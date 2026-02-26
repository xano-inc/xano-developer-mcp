---
applyTo: ""
---

# Array Filters & Functions

Complete reference for XanoScript array filters, functional operations, and statement-level array functions.

> **These filters operate on ARRAY values only.** Do not use string filters (`strlen`, `substr`, `split`, `replace`) on arrays. Use `count` for array length, `slice` for sub-arrays, `join` to convert to string.

## Quick Reference

### Array Filters

| Filter | Example | Result |
|--------|---------|--------|
| `first` | `[1,2,3]\|first` | `1` |
| `last` | `[1,2,3]\|last` | `3` |
| `count` | `[1,2,3]\|count` | `3` |
| `reverse` | `[1,2,3]\|reverse` | `[3,2,1]` |
| `unique` | `[1,1,2]\|unique` | `[1,2]` |
| `flatten` | `[[1,2],[3]]\|flatten` | `[1,2,3]` |
| `shuffle` | `[1,2,3]\|shuffle` | Random order |
| `slice` | `[1,2,3,4]\|slice:1:2` | `[2,3]` -- offset 1, length 2 |
| `push` | `[1,2]\|push:3` | `[1,2,3]` |
| `pop` | `[1,2,3]\|pop` | `3` |
| `shift` | `[1,2,3]\|shift` | `1` |
| `unshift` | `[1,2]\|unshift:0` | `[0,1,2]` |
| `merge` | `[1,2]\|merge:[3,4]` | `[1,2,3,4]` |
| `diff` | `[1,2,3]\|diff:[2]` | `[1,3]` |
| `intersect` | `[1,2,3]\|intersect:[2,3,4]` | `[2,3]` |
| `join` | `["a","b"]\|join:","` | `"a,b"` |
| `range` | `\|range:1:5` | `[1,2,3,4,5]` |
| `..` | `(1..5)` | `[1,2,3,4,5]` |

### Range Operator

```xs
(1..5)                                      // [1,2,3,4,5]
(0..10)                                     // [0,1,2,3,4,5,6,7,8,9,10]
($start..$end)                              // Dynamic range with variables
```

### Functional Operations

```xs
// Map - transform each element
[{v:1},{v:2}]|map:$$.v*2                    // [2,4]

// Filter - keep matching elements
[1,2,3,4]|filter:$$%2==0                    // [2,4]

// Find - first matching element
[{id:1},{id:2}]|find:$$.id==2               // {id:2}

// FindIndex - index of first match
[{id:1},{id:2}]|findIndex:$$.id==2          // 1

// Some - any element matches?
[1,2,3]|some:$$>2                           // true

// Every - all elements match?
[2,4,6]|every:$$%2==0                       // true

// Reduce - accumulate to single value
[1,2,3,4]|reduce:$$+$result:0               // 10
```

### Array Element Access: `|get` vs `|slice`

> **`|get:N`** returns a **single element** by zero-based index.
> **`|slice:offset:length`** returns a **sub-array**, skipping `offset` elements and returning the next `length` elements.

| Method | Use For | Example | Result |
|--------|---------|---------|--------|
| `\|get:N` | Single element by index (0-based) | `[10,20,30]\|get:0` | `10` |
| `\|slice:offset:length` | Sub-array -- skip N, take M | `[10,20,30,40]\|slice:1:2` | `[20,30]` |
| `\|first` | First element | `[10,20,30]\|first` | `10` |
| `\|last` | Last element | `[10,20,30]\|last` | `30` |

```xs
var $third { value = $items|get:2 }             // 0-based: 3rd element
var $page { value = $items|slice:10:5 }          // skip 10, return 5 elements
```

### Grouping & Indexing

```xs
// Group by property
[{g:"a",v:1},{g:"b",v:2},{g:"a",v:3}]|index_by:g
// {"a":[{g:"a",v:1},{g:"a",v:3}],"b":[{g:"b",v:2}]}

// Sort
[{n:"z"},{n:"a"}]|sort:n:text:false         // Ascending by n
```

### Math on Arrays

```xs
[1,2,3,4]|sum        // 10
[1,2,3,4]|avg        // 2.5
[1,2,3,4]|product    // 24
[5,2,8,1]|array_min  // 1
[5,2,8,1]|array_max  // 8
```

### Array Filtering

| Filter | Description | Example |
|--------|-------------|---------|
| `filter_empty` | Remove empty values | `$arr\|filter_empty` |
| `filter_empty_text` | Remove empty strings | `$arr\|filter_empty_text` |
| `filter_empty_array` | Remove empty arrays | `$arr\|filter_empty_array` |
| `filter_empty_object` | Remove empty objects | `$arr\|filter_empty_object` |
| `filter_null` | Remove null values | `$arr\|filter_null` |
| `filter_zero` | Remove zero values | `$arr\|filter_zero` |
| `filter_false` | Remove false values | `$arr\|filter_false` |

```xs
[1, null, "", 0, "text", false]|filter_empty      // [1, "text"]
["a", "", "b", ""]|filter_empty_text              // ["a", "b"]
```

### Array Fill Operations

```xs
|fill:5:"x"                                  // ["x", "x", "x", "x", "x"]
["a", "b"]|fill_keys:{"a": 1, "b": 2}        // {a: 1, b: 2}
```

### Deep Merge & Comparison

```xs
{a: {b: 1}}|merge_recursive:{a: {c: 2}}      // {a: {b: 1, c: 2}}
[1, 2, 3]|diff_assoc:[2]                     // Associative diff
[1, 2, 3]|intersect_assoc:[2, 3, 4]          // Associative intersect
```

## Array Functions (Statement-Level)

Statement-level functions for manipulating arrays within stacks. Unlike filters (e.g., `$arr|push:3`), these are standalone operations.

> **Syntax note:** Functions that use a `{ by = ... }` or `{ value = ... }` block wrap the array in parentheses -- e.g., `array.map ($arr) { ... }`. Functions that use an `if (...)` condition take a bare variable -- e.g., `array.filter $arr if (...) as $result`.

### array.push / array.unshift

```xs
array.push $shopping_cart { value = "oranges" }
array.unshift $priority_tasks { value = "urgent meeting" }
```

### array.pop / array.shift

```xs
array.pop $completed_tasks as $last_finished_task
array.shift $waiting_list as $next_customer
```

### array.merge

```xs
array.merge $active_users { value = $new_users }
```

### array.find / array.find_index

```xs
array.find $customer_ages if ($this > 18) as $first_adult_age
array.find_index $sale_prices if ($this < 20) as $first_discount_index
```

### array.has / array.every

```xs
array.has $team_roles if ($this == "manager") as $has_manager
array.every $exam_scores if ($this >= 70) as $all_passed
```

### array.filter / array.filter_count

```xs
array.filter $temperatures if ($this > 32) as $above_freezing
array.filter_count $survey_responses if ($this == "yes") as $yes_count
```

### array.map

```xs
array.map ($json) {
  by = $this.email
} as $emails

array.map ($json) {
  by = {name: $this.name, gender: $this.gender}
} as $people
```

### array.partition / array.group_by

```xs
array.partition ($json) if ($this.gender == "male") as $is_male

array.group_by ($users) {
  by = $this.gender
} as $user_by_gender
```

### array.union / array.difference / array.intersection

```xs
array.union ([1,3,5,7,9]) {
  value = [2,4,6,8]
  by = $this
} as $union
// Result: [1,2,3,4,5,6,7,8,9]

array.difference ([1,2,3,4,5,6,7,8,9]) {
  value = [2,4,6,8]
  by = $this
} as $difference
// Result: [1,3,5,7,9]

array.intersection ([1,2,3,4,5,6,7,8,9]) {
  value = [2,4,6,8]
  by = $this
} as $intersection
// Result: [2,4,6,8]
```

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `syntax` | Core operators, conditionals, type filters, error handling |
| `syntax/string-filters` | String filters, encoding, and security filters |
| `syntax/functions` | Math and object functions |
