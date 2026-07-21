---
applyTo: ""
---

# Expression Filter Reference

> **TL;DR:** Signatures, argument lists, and worked examples for all 210 Xano expression filters (transformers), grouped by category. Apply with `value|filter:arg1:arg2`. Where a filter has two names, the **display name** heads the entry and the canonical engine alias follows in parentheses — both are accepted. Do not invent filter names: if a filter is not in this reference, it does not exist.

Format of each entry: `display_name` (canonical alias) : input type → result type — description, arguments (with type and default), then `example` → `answer`.

Need only a few entries? Call `xano_xanoscript_docs({ filter: "round" })` (comma-separate for several, e.g. `filter: "to_upper,split"`) to fetch just those filters instead of this whole document.

## Quick Reference

- **math:** `deg2rad`, `rad2deg`, `number_format`, `sin`, `asin`, `asinh`, `cos`, `acos`, `acosh`, `tan`, `atan`, `atanh`, `floor`, `ceil`, `round`, `abs`, `sqrt`, `exp`, `log`, `log10`, `ln`, `pow`, `array_min` (`min`), `array_max` (`max`), `min` (`num_min`), `max` (`num_max`), `sum`, `avg`, `product`, `add`, `subtract` (`sub`), `multiply` (`mul`), `modulus` (`mod`), `divide` (`div`), `bitwise_and`, `bitwise_or`, `bitwise_xor`
- **array:** `first`, `last`, `count`, `range`, `reverse`, `unique`, `safe_array`, `flatten`, `filter_empty`, `sort` (`fsort`), `shuffle` (`array_shuffle`), `diff` (`array_diff`), `diff_assoc` (`array_diff_assoc`), `intersect` (`array_intersect`), `intersect_assoc` (`array_intersect_assoc`), `merge` (`array_merge`), `merge_recursive` (`array_merge_recursive`), `index_by`, `push` (`array_push`), `pop` (`array_pop`), `unshift` (`array_unshift`), `shift` (`array_shift`), `remove` (`array_remove`), `append`, `prepend`, `join`, `slice` (`array_slice`), `keys` (`array_keys`), `values` (`array_values`), `entries` (`array_entries`), `map`, `filter`, `some`, `every`, `find`, `findIndex`, `reduce`, `pick`, `unpick`
- **comparison:** `equals` (`eq`), `not_equals` (`ne`), `greater_than` (`gt`), `greater_than_or_equal` (`gte`), `less_than` (`lt`), `less_than_or_equal` (`lte`), `odd`, `even`, `in`, `not`, `bitwise_not`, `is_null` (`null`), `is_empty` (`empty`), `is_object`, `is_array`, `is_int`, `is_decimal`, `is_bool`, `is_text`
- **text:** `addslashes`, `escape`, `list_encodings`, `detect_encoding`, `to_utf8`, `from_utf8`, `convert_encoding`, `to_lower` (`lower`), `to_upper` (`upper`), `trim`, `ltrim`, `rtrim`, `capitalize`, `substr`, `split`, `strlen`, `strip_html` (`strip_tags`), `unaccent` (`strip_accents`), `index` (`strpos`), `iindex` (`stripos`), `starts_with`, `istarts_with`, `ends_with`, `iends_with`, `contains`, `icontains`, `url_addarg`, `url_delarg`, `url_hasarg`, `url_getarg`, `url_parse`, `querystring_parse`, `concat`, `sprintf`, `replace` (`string_replace`), `regex_matches` (`regex_test`), `regex_get_first_match` (`regex_match`), `regex_get_all_matches` (`regex_match_all`), `regex_quote`, `regex_replace`
- **manipulation:** `set`, `set_conditional`, `set_ifnotempty`, `set_ifnotnull`, `first_notnull`, `first_notempty`, `unset`, `transform`, `get`, `has`, `fill` (`array_fill`), `fill_keys` (`array_fill_keys`)
- **transform:** `to_expr`, `to_text`, `to_int`, `to_decimal`, `to_bool`, `to_timestamp` (`to_epochms`), `to_ms` (`to_epoch_ms`), `to_seconds` (`to_epoch_sec`), `to_minutes` (`to_epoch_minute`), `to_hours` (`to_epoch_hour`), `to_days` (`to_epoch_day`), `create_object`, `create_object_from_entries`, `json_decode`, `json_encode`, `xml_decode`, `csv_parse`, `csv_decode`, `csv_encode`, `csv_create`, `url_decode`, `url_decode_rfc3986`, `url_encode`, `url_encode_rfc3986`, `yaml_decode`, `yaml_encode`, `hex2bin`, `bin2hex`, `dechex`, `hexdec`, `decbin`, `bindec`, `decoct`, `octdec`, `base_convert`, `base64_decode`, `base64_encode`, `base64_decode_urlsafe`, `base64_encode_urlsafe`
- **security:** `encrypt`, `decrypt`, `jws_encode` (`crypto_jws_encode`), `jws_decode` (`crypto_jws_decode`), `jwe_encode` (`crypto_jwe_encode`), `jwe_decode` (`crypto_jwe_decode`), `secureid_encode`, `secureid_decode`, `md5`, `sha1`, `sha256`, `sha384`, `sha512`, `hmac_md5`, `hmac_sha1`, `hmac_sha256`, `hmac_sha384`, `hmac_sha512`, `uuid` (`uuid4`)
- **timestamp:** `parse_timestamp` (`epochms_from_format`), `format_timestamp` (`epochms_date`), `transform_timestamp` (`epochms_transform`), `add_secs_to_timestamp` (`epochms_add_secs`), `add_ms_to_timestamp` (`epochms_add_ms`)

## Math Filters

### `deg2rad`

`decimal → decimal` — Convert degrees to radians

```
180|deg2rad   // 3.141592...
```

### `rad2deg`

`decimal → decimal` — Convert radians to degrees

```
3.141592|rad2deg   // 180
```

### `number_format`

`any → string` — Format a number with flexible support over decimal places, thousands separator, and decimal separator.

Args:
- `decimals` (int, default `0`) — The number of decimal digits
- `decimal_separator` (text, default `"."`) — The separator value used for the decimal point
- `thousands_separator` (text, default `","`) — The separator value used for grouping each set of thousands.

```
31253212.141592|number_format:2:.:,   // "31,253,212.14"
```

### `sin`

`decimal → decimal` — Calculates the sine of the supplied value in radians

```
3.14159|sin   // 0
```

### `asin`

`decimal → decimal` — Calculates the arc sine of the supplied value in radians

```
1|asin   // 1.57079...
```

### `asinh`

`decimal → decimal` — Calculates the inverse hyperbolic sine of the supplied value in radians

```
1|asinh   // 0.88137...
```

### `cos`

`decimal → decimal` — Calculates the cosine of the supplied value in radians

```
1|cos   // 0.54030...
```

### `acos`

`decimal → decimal` — Calculates the arc cosine of the supplied value in radians

```
1|acos   // 0
```

### `acosh`

`decimal → decimal` — Calculates the inverse hyperbolic cosine of the supplied value in radians

```
11.592|acosh   // 3.14159...
```

### `tan`

`decimal → decimal` — Calculates the tangent of the supplied value in radians

```
0.785398|tan   // 1
```

### `atan`

`decimal → decimal` — Calculates the arc tangent of the supplied value in radians

```
1|atan   // 0.78539...
```

### `atanh`

`decimal → decimal` — Calculates the inverse hyperbolic tangent of the supplied value in radians

```
0.6666|atanh   // 0.80470...
```

### `floor`

`decimal → decimal` — Round a decimal down to its integer equivalent

```
2.5|floor   // 2
```

### `ceil`

`decimal → decimal` — Round a decimal up to its integer equivalent

```
2.5|ceil   // 3
```

### `round`

`decimal → decimal` — Round a decimal with optional precision

Args:
- `precision` (int, default `0`) — the number of decimal digits to round to

```
2.5432|round:1   // 3
```

### `abs`

`<T> → decimal` — Returns the absolute value

```
-10|abs   // 10
```

### `sqrt`

`<T> → decimal` — Returns the square root of the value

```
9|sqrt   // 3
```

### `exp`

`<T> → decimal` — Returns the exponent of mathematical expression "e"

```
0|exp   // 1
```

### `log`

`<T> → decimal` — Returns the logarithm with a custom base

Args:
- `base` (<T>)

```
2|log:2   // 1
```

### `log10`

`<T> → decimal` — Returns the Base-10 logarithm

```
100|log10   // 2
```

### `ln`

`<T> → decimal` — Returns the natural logarithm

```
10|ln   // 2.30258...
```

### `pow`

`<T> → decimal` — Returns the value raised to the power of exp.

Args:
- `exp` (<T>)

```
10|pow:2   // 100
```

### `array_min` (alias `min`)

`<T>[] → decimal` — Returns the min of the values of the array

```
[1,2,3]|array_min   // 1
```

### `array_max` (alias `max`)

`<T>[] → decimal` — Returns the max of the values of the array

```
[1,2,3]|max   // 3
```

### `min` (alias `num_min`)

`int | decimal → decimal` — Returns the min both values

Args:
- `value` (any)

```
1|num_min:0   // 0
```

### `max` (alias `num_max`)

`int | decimal → decimal` — Returns the max both values

Args:
- `value` (any)

```
5|num_max:20   // 20
```

### `sum`

`<T>[] → decimal` — Returns the sum of the values of the array

```
[1,2,3,4]|sum   // 10
```

### `avg`

`<T>[] → decimal` — Returns the average of the values of the array

```
[1,2,3,4]|avg   // 2.5
```

### `product`

`<T>[] → decimal` — Returns the product of the values of the array

```
[1,2,3,4]|product   // 24
```

### `add`

`decimal → decimal` — Add 2 values together and return the answer

Args:
- `value` (decimal)

```
2|add:3   // 5
```

### `subtract` (alias `sub`)

`decimal → decimal` — Subtract 2 values together and return the answer

Args:
- `value` (decimal)

```
2|sub:3   // -1
```

### `multiply` (alias `mul`)

`decimal → decimal` — Multiply 2 values together and return the answer

Args:
- `value` (decimal)

```
2|mul:3   // 6
```

### `modulus` (alias `mod`)

`int → int` — Modulus 2 values together and return the answer

Args:
- `value` (int)

```
20|mod:3   // 2
```

### `divide` (alias `div`)

`decimal → decimal` — Divide 2 values together and return the answer

Args:
- `value` (decimal)

```
20|div:4   // 5
```

### `bitwise_and`

`int → int` — Bitwise AND 2 values together and return the answer

Args:
- `value` (int)

```
7|bitwise_and:3   // 3
```

### `bitwise_or`

`int → int` — Bitwise OR 2 values together and return the answer

Args:
- `value` (int)

```
7|bitwise_or:9   // 15
```

### `bitwise_xor`

`int → int` — Bitwise XOR 2 values together and return the answer

Args:
- `value` (int)

```
7|bitwise_xor:9   // 14
```

## Array Filters

### `first`

`<T>[] → <T>` — Get the first entry of an array

```
["five","six","seven"]|first   // "five"
```

### `last`

`<T>[] → <T>` — Get the last entry of an array

```
["five","six","seven"]|last   // "seven"
```

### `count`

`<T>[] → int` — Return the number of items in an object/array

```
["five","six","seven"]|count   // 3
```

### `range`

`<T> → int[]` — Returns array of values between the specified start/stop.

Args:
- `start` (int) — the start of the range sequence
- `stop` (int) — the end of the range sequence

```
|range:10:15   // [10,11,12,13,14,15]
```

### `reverse`

`<T>[] → <T>[]` — Returns values of an array in reverse order

```
[12,13,14,15]|reverse   // [15,14,13,12]
```

### `unique`

`<T>[] → <T>[]` — Returns unique values of an array

Args:
- `path` (text) — an optional path within an object - leave blank if just text or numbers

```
[12,13,13,12,11]|unique   // [12,13,11]
```

### `safe_array`

`<T> | <T>[] → <T>[]` — Always returns an array. Uses the existing value if it is an array or creates an array of one element.

```
12|safe_array   // [12]
```

### `flatten`

`<T>[] → <T>[]` — Flattens a multidimensional array into a single level array of values.

```
[1,[2,3],[[4,5]]]|flatten   // [1,2,3,4,5]
```

### `filter_empty`

`<T>[] → <T>[]` — Returns a new array with only entries that are not empty ("", null, 0, "0", false, [], {})

Args:
- `path` (text) — an optional path within an object - leave blank if just text or numbers

```
[{a:1, b:null}, {a:0, b:4}]|filter_empty:a   // [{a:1, b:null}]
```

### `sort` (alias `fsort`)

`<T>[] → <T>[]` — Sort an array of elements with an optional path inside the element

Args:
- `path` (text) — an optional path into an object
- `type` (enum, default `"itext"`) — the sorting type - number, text, natural or case-insensitive versions - itext & inatural
- `asc` (bool, default `true`) — ascending or descending

```
[{v:"a", e:20}, {v:"z", e:10}]|fsort:v:text:true   // [{v:"z", e:10}, {v:"a", e:20}]
```

### `shuffle` (alias `array_shuffle`)

`<T>[] → <T>[]` — Shuffles the order of the entries in the array.

```
[1,2,3,4]|array_shuffle   // [3,2,4,1]
```

### `diff` (alias `array_diff`)

`<T>[] → <T>[]` — Return the entries from the first array that are not in the second array. Only values are used for matching.

Args:
- `value` (<T>[])

```
[1,2,3,4]|array_diff:[3,2]   // [1,4]
```

### `diff_assoc` (alias `array_diff_assoc`)

`<T>[] → <T>[]` — Return the entries from the first array that are not in the second array. Values and keys are used for matching.

Args:
- `value` (<T>[])

```
[{"a": "green"},{"b": "brown"},{"c":"blue"},"red"]|array_diff_assoc:[{"a":"green"}, "yellow", "red"]   // [{a: "green",b: "brown", "red"]
```

### `intersect` (alias `array_intersect`)

`<T>[] → <T>[]` — Return the entries from the first array that are also present in the second array. Only values are used for matching.

Args:
- `value` (<T>[])

```
[1,2,3,4]|intersect:[3,2]   // [2,3]
```

### `intersect_assoc` (alias `array_intersect_assoc`)

`<T>[] → <T>[]` — Return the entries from the first array that are also present in the second array. Values and keys are used for matching.

Args:
- `value` (<T>[])

```
[{"a": "green"},{"b": "brown"},{"c":"blue"},"red"]|array_intersect_assoc:[{"a":"green"},{"b":"yellow"},"blue","red"]   // [{a: "green",b: "brown", "red"]
```

### `merge` (alias `array_merge`)

`<T>[] → <T>[]` — Merge the first level of elements of both arrays together and return the new array

Args:
- `value` (<T>[])

```
[1,2,3]|merge:["a","b","c"]   // [1,2,3,"a","b","c"]
```

### `merge_recursive` (alias `array_merge_recursive`)

`<T>[] → <T>[]` — Merge the elements from all levels of both arrays together and return the new array

Args:
- `value` (<T>[])

```
{color:{favorite: ["red"]}}|merge_recursive:{color: {favorite: ["green","blue"]}}   // {"color":{"favorite": ["red","green","blue"]}}
```

### `index_by`

`<T>[] → <T>[]` — Create a new array indexed off of the value of each item's path

Args:
- `path` (text)

```
[{id:1,g:"x"},{id:2,g:"y"},{id:3,g:"x"}]|index_by:g   // {"x": [{"id":1,"g":"x"},{"id":3,"g":"x"}], "y": [{"id":2,"g":"y"}]}
```

### `push` (alias `array_push`)

`<T>[] → <T>[]` — Push an element on to the end of an array and return the new array

Args:
- `value` (<T>)

```
[1,2,3]|array_push:"a"   // [1,2,3,"a"]
```

### `pop` (alias `array_pop`)

`<T>[] → <T>` — Pops the last element of the array off and returns it

```
[1,2,3]|array_pop   // 3
```

### `unshift` (alias `array_unshift`)

`<T>[] → <T>[]` — Push an element to the beginning of an array and return the new array

Args:
- `value` (<T>)

```
[1,2,3]|array_unshift:0   // [0,1,2,3]
```

### `shift` (alias `array_shift`)

`<T>[] → <T>` — Shifts the first element of the array off and returns it

```
[1,2,3]|shift   // 1
```

### `remove` (alias `array_remove`)

`<T>[] → <T>[]` — Remove any elements from the array that match the supplied value and then return the new array

Args:
- `value` (<T>)
- `path` (text) — an optional path into an object
- `strict` (bool, default `false`) — enforce strict type matching (100 vs "100")

```
[{v:1},{v:2},{v:3}]|remove:{v:2}   // [{v:1},{v:3}]
```

### `append`

`<T>[] → <T>[]` — Push an element on to the end of an array within an object and return the updated object

Args:
- `value` (<T>)
- `path` (text) — an optional path into an object

```
[1,2,3]|append:4   // [1,2,3,4]
```

### `prepend`

`<T>[] → <T>[]` — Push an element on to the beginning of an array within an object and return the updated object

Args:
- `value` (<T>)
- `path` (text) — an optional path into an object

```
[1,2,3]|prepend:0   // [0,1,2,3]
```

### `join`

`<T>[] → text` — Joins an array into a text string via the separator and returns the result

Args:
- `separator` (text) — the value used for joining the text array

```
["Epic","Battle"]|join:" "   // "Epic Battle"
```

### `slice` (alias `array_slice`)

`<T>[] → <T>[]` — Extract a section from an array.

Args:
- `offset` (int, default `0`) — The offset into the array
- `length` (int, default `-1`) — The length from the offset. Negative values start at the end.

```
[1,2,3,4,5]|array_slice:2:2   // [3,4]
```

### `keys` (alias `array_keys`)

`obj | json → text[]` — Get the property keys of an object/array as a numerically indexed array.

```
{"a":1,"b":2,"c":3}|array_keys   // ["a","b","c"]
```

### `values` (alias `array_values`)

`obj | json → any[]` — Get the property values of an object/array as a numerically indexed array

```
{"a":1,"b":2,"c":3}|array_values   // [1,2,3]
```

### `entries` (alias `array_entries`)

`obj | json → any[]` — Get the property entries of an object/array as a numerically indexed array of key/value pairs.

```
{"a":1,"b":2,"c":3}|array_entries   // [{key:"a",value:1},{key:"b",value:2},{key:"c",value:3}]
```

### `map`

`any[] → any[]` — Creates a new array with the results of calling a provided function on every element in the calling array.

Args:
- `code` (text) — return the replacement value

```
[{value: 2}, {value: 5}]|map:$$.value*2   // double each value => [4,10]
```

### `filter`

`any[] → any[]` — Filters the elements of an array based on the code block returning true to keep the element or false to skip it.

Args:
- `code` (text) — return true to keep the element

```
[{value: 2}, {value: 5}]|filter:$$.value%2==0   // 
```

### `some`

`any[] → any[]` — Checks if at least one element in the array passes the test implemented by the provided function.

Args:
- `code` (text) — return true the element is found

```
[{value: 2}, {value: 5}]|some:$$.value%2==0   // at least one value is even => true
```

### `every`

`any[] → any[]` — Checks if all elements in the array pass the test implemented by the provided function.

Args:
- `code` (text) — return true the element is found

```
[{value: 2}, {value: 6}]|every:$$.value%2==0   // all values are even => true
```

### `find`

`any[] → any[]` — Finds if all elements in the array pass the test implemented by the provided function.

Args:
- `code` (text) — return true the element is found

```
[{id: 1}, {id: 2}, {id: 3}]|find:$$.id==2   // returns {id:2}
```

### `findIndex`

`any[] → any[]` — Finds the index of the first element in the array that passes the test implemented by the provided function.

Args:
- `code` (text) — return true the element is found

```
[{id: 1}, {id: 2}, {id: 3}]|findIndex:$$.id==2   // returns 1
```

### `reduce`

`any[] → any[]` — Reduces the array to a single value using the code block to combine each element of the array.

Args:
- `code` (text) — return the new result
- `initial_value` (int, default `0`) — The initial value to start with for the first value of $result.

```
[1,2,3,4,5]|reduce:$$+$result:10   // returns 25
```

### `pick`

`<T> → <T>` — Pick keys from the object to create a new object of just those keys.

Args:
- `keys` (text) — comma seperated list of keys

```
{a:1,b:2,c:3}|pick:[a,c]   // returns {a:1,c:3}
```

### `unpick`

`<T> → <T>` — Remove keys from the object to create a new object of the remaining keys.

Args:
- `keys` (text) — comma seperated list of keys to exclude

```
{a:1,b:2,c:3}|unpick:[a,c]   // returns {b:2}
```

## Comparison Filters

### `equals` (alias `eq`)

`<T> → bool` — Returns a boolean if both values are equal

Args:
- `value` (<T>)

```
4|eq:4   // true
```

### `not_equals` (alias `ne`)

`<T> → bool` — Returns a boolean if both values are not equal

Args:
- `value` (<T>)

```
4|ne:4   // false
```

### `greater_than` (alias `gt`)

`<T> → bool` — Returns a boolean if the left value is greater than the right value

Args:
- `value` (<T>)

```
4|gt:2   // true
```

### `greater_than_or_equal` (alias `gte`)

`<T> → bool` — Returns a boolean if the left value is greater than or equal to the right value

Args:
- `value` (<T>)

```
4|gte:2   // true
```

### `less_than` (alias `lt`)

`<T> → bool` — Returns a boolean if the left value is less than the right value

Args:
- `value` (<T>)

```
4|lt:2   // false
```

### `less_than_or_equal` (alias `lte`)

`<T> → bool` — Returns a boolean if the left value is less than or equal to the right value

Args:
- `value` (<T>)

```
4|lte:2   // false
```

### `odd`

`int → bool` — Returns whether or not the value is odd

```
4|odd   // false
```

### `even`

`int → bool` — Returns whether or not the value is even

```
4|even   // true
```

### `in`

`<T>[] → bool` — Returns whether or not the value is in the array

Args:
- `search` (<T>) — The searched value

```
[1,2,3]|in:3   // true
```

### `not`

`bool → bool` — Returns the opposite of the existing value evaluated as a boolean

```
true|not   // false
```

### `bitwise_not`

`int → int` — Returns the existing value with its bits flipped

```
8|bitwise_not   // -9
```

### `is_null` (alias `null`)

`<T> → bool` — Returns whether or not the value is null

```
8|is_null   // false
```

### `is_empty` (alias `empty`)

`<T> → bool` — Returns whether or not the value is empty ("", null, 0, "0", false, [], {})

```
[]|is_empty   // true
```

### `is_object`

`<T> → bool` — Returns whether or not the value is an object.

```
{id:2, value:3, size:4}|is_object   // true
```

### `is_array`

`<T> → bool` — Returns whether or not the value is a numerical indexed array.

```
[1,2,3]|is_array   // true
```

### `is_int`

`<T> → bool` — Returns whether or not the value is an integer.

```
123|is_int   // true
```

### `is_decimal`

`<T> → bool` — Returns whether or not the value is a decimal value.

```
123.45|is_decimal   // true
```

### `is_bool`

`<T> → bool` — Returns whether or not the value is a boolean.

```
false|is_bool   // true
```

### `is_text`

`<T> → bool` — Returns whether or not the value is text.

```
"213"|is_text   // true
```

## Text Filters

### `addslashes`

`text → text` — Adds a backslash to the following characters: single quote, double quote, backslash, and null character.

```
'he said "Hi!"'|addslashes   // "he said \\"Hi!\\""
```

### `escape`

`text → text` — Converts special characters into their escaped variants. Ex: for tabs and for newlines.

```
'he said
- "Hi!"'|escape   // "he said \\n-\\\"Hi!\\\""
```

### `list_encodings`

`any → text[]` — List support character encodings

```
|list_encodings   // ["UTF-8", "ISO-8859-1", ...]
```

### `detect_encoding`

`text → text` — Detect the character encoding of the supplied text

Args:
- `encodings` (text) — optional - leave blank to auto-detect or include a comma seperated list of encodings

```
"étude"|detect_encoding   // UTF-8
```

### `to_utf8`

`text → text` — Convert the supplied text from its binary form (ISO-8859-1) to UTF-8.

```
"�tudes"|to_utf8   // "études"
```

### `from_utf8`

`text → text` — Convert the supplied text from UTF-8 to its binary form (ISO-8859-1).

```
"études"|from_utf8   // "�tudes"
```

### `convert_encoding`

`text → text` — Convert the character encoding of the supplied text

Args:
- `to` (text) — the resulting character encoding
- `from` (text) — the current character encoding of the supplied text. This is commonly identified by the result of detect_encoding.

```
"études"|convert_encoding:"ISO-8859-1":"UTF-8"   // "�tudes"
```

### `to_lower` (alias `lower`)

`text → text` — Converts all characters to lower case and returns the result

```
"Epic Battle"|lower   // "epic battle"
```

### `to_upper` (alias `upper`)

`text → text` — Converts all characters to upper case and returns the result

```
"Epic Battle"|upper   // "EPIC BATTLE"
```

### `trim`

`text | text[] → text` — Trim whitespace or other characters from both sides and return the result

Args:
- `mask` (text) — optional - include a list of characters to trim or leave blank to trim whitespace

```
"  Epic Battle  "|trim   // "Epic Battle"
```

### `ltrim`

`text | text[] → text` — Trim whitespace or other characters from the left side and return the result

Args:
- `mask` (text) — optional - include a list of characters to trim or leave blank to trim whitespace

```
"  Epic Battle  "|ltrim   // "Epic Battle  "
```

### `rtrim`

`text | text[] → text` — Trim whitespace or other characters from the right return the result

Args:
- `mask` (text) — optional - include a list of characters to trim or leave blank to trim whitespace

```
"  Epic Battle  "|rtrim   // "  Epic Battle"
```

### `capitalize`

`text → text` — Converts the first letter of each word to a capital letter

```
"epic battle"|capitalize   // "Epic Battle"
```

### `substr`

`text → text` — Extracts a section of text

Args:
- `start` (int) — the starting position of text extraction. negative values start at the end.
- `length` (int) — optional - the length of the extraction. negative values will omit values from the end.

```
"Epic Battle"|substr:5:6   // "Battle"
```

### `split`

`text → text[]` — Splits text into an array of text and returns the result

Args:
- `separator` (text) — the value used for splitting the text

```
"Epic Battle"|split:" "   // ["Epic","Battle"]
```

### `strlen`

`text → int` — Returns the number of characters

```
"Epic Battle"|strlen   // 11
```

### `strip_html` (alias `strip_tags`)

`text → text` — Removes HTML tags from a string

Args:
- `exclude` (text) — optional - exclude certain tags. i.e.

```
"<p>Epic Battle</p>"|strip_html   // "Epic Battle"
```

### `unaccent` (alias `strip_accents`)

`text → text` — Removes accents from characters

```
"études"|unaccent   // "etudes"
```

### `index` (alias `strpos`)

`text → int` — Returns the index of the case-sensitive expression or false if it can't be found

Args:
- `search` (text)

```
"Epic Battle"|strpos:"Battle"   // 5
```

### `iindex` (alias `stripos`)

`text → int` — Returns the index of the case-insensitive expression or false if it can't be found

Args:
- `search` (text)

```
"Epic Battle"|stripos:"battle"   // 5
```

### `starts_with`

`text → bool` — Returns whether or not the expression is present at the beginning

Args:
- `search` (text)

```
"Epic Battle"|starts_with:"Epic"   // true
```

### `istarts_with`

`text → bool` — Returns whether or not the case-insensitive expression is present at the beginning

Args:
- `search` (text)

```
"Epic Battle"|istarts_with:"epic"   // true
```

### `ends_with`

`text → bool` — Returns whether or not the expression is present at the end

Args:
- `search` (text)

```
"Epic Battle"|ends_with:"Battle"   // true
```

### `iends_with`

`text → bool` — Returns whether or not the case-insensitive expression is present at the end

Args:
- `search` (text)

```
"Epic Battle"|iends_with:"battle"   // true
```

### `contains`

`text → bool` — Returns whether or not the expression is found

Args:
- `search` (text)

```
"Epic Battle"|contains:"Battle"   // true
```

### `icontains`

`text → bool` — Returns whether or not the case-insensitive expression is found

Args:
- `search` (text)

```
"Epic Battle"|icontains:"battle"   // true
```

### `url_addarg`

`text → text` — Parses a URL and returns an updated version with an encoded version of the supplied argument

Args:
- `key` (text) — the argument key
- `value` (text) — the argument value
- `encoding_rfc3986` (bool, default `false`) — whether or not to use the RFC 3986 specification

```
"https://example.com?foo=bar"|url_addarg:"fiz":"buz"   // "https://example.com?foo=bar&fiz=buz"
```

### `url_delarg`

`text → text` — Parses a URL and returns an updated version with the supplied argument removed

Args:
- `key` (text) — the argument key

```
"https://example.com?foo=bar&fiz=buz"|url_delarg:"fiz"   // "https://example.com?foo=bar"
```

### `url_hasarg`

`text → text` — Returns the existence of a argument in the URL

Args:
- `key` (text) — the argument key

```
"https://example.com?foo=bar&fiz=buz"|url_hasarg:"fiz"   // true
```

### `url_getarg`

`text → text` — Gets the argument's value from a URL

Args:
- `key` (text) — the argument key
- `default` (text, default `""`) — the default is used if no argument is found in the URL

```
"https://example.com?foo=bar&fiz=buz"|url_getarg:"fiz"   // "buz"
```

### `url_parse`

`text → json` — Parses a URL into its individual components.

```
"https://username:password@example.com:8080/path?foo=bar&fiz=buz#fragment"|url_parse   // {
  "scheme": "https",
  "host": "example.com",
  "port": 8080,
  "user": "username",
  "pass": "password",
  "path": "/path",
  "query": "foo=bar&fiz=buz",
  "fragment": "fragment"
}
```

### `querystring_parse`

`text → json` — Parses a query string from a URL into its individual key-value pairs.

```
"foo=bar&fiz=buz"|querystring_parse   // {"foo": "bar", "fiz": "buz"}
```

### `concat`

`text | int | decimal → text` — Concatenates two values together

Args:
- `value` (text) — the text being concatenated
- `sep` (text, default `""`) — an optional separator between both text strings

```
"Hello" | concat:"World!":" - "   // "Hello - World!"
```

### `sprintf`

`text → text` — formats text with variable substitution

```
"Hello %s, you have %d new messages"|sprintf:"Bob":5   // "Hello Bob, you have 5 new messages"
```

### `replace` (alias `string_replace`)

`text → text` — Replace all occurrences of a text phrase with another

Args:
- `search` (text) — the text being replaced
- `replacement` (text) — the replacement text

```
"Hella World"|string_replace:"o":"a"   // "Hella Warld"
```

### `regex_matches` (alias `regex_test`)

`text → bool` — Tests if a regular expression matches the supplied subject text.

Args:
- `subject` (text)

```
"/^a.*c$/"|regex_test:"abbbbc"   // true
```

### `regex_get_first_match` (alias `regex_match`)

`text → text[]` — Return the first set of matches performed by a regular expression on the supplied subject text.

Args:
- `subject` (text)

```
"/(\w+)@(\w+).(\w+)/"|regex_match:"test@example.com"   // ["test@example.com","test","example","com"]
```

### `regex_get_all_matches` (alias `regex_match_all`)

`text → text[]` — Return all matches performed by a regular expression on the supplied subject text.

Args:
- `subject` (text)

```
"/\b\w+@\w+.\w+\b/"|regex_match_all:"test@example.com"   // [["test@example.com"]]
```

### `regex_quote`

`text → text` — Update the supplied text value to be properly escaped for regular expressions.

Args:
- `delimiter` (text, default `""`) — An optional delimiter character to escape.

```
"Hello. How are you?"|regex_quote:"/"   // "Hello\\. How are you\\?"
```

### `regex_replace`

`text → text` — Perform a regular expression search and replace on the supplied subject text.

Args:
- `replacement` (text)
- `subject` (text)

```
"/\s+/"|regex_replace:"-":"Hello   World"   // "Hello-World"
```

## Manipulation Filters

### `set`

`any | any[] → any` — Sets a value at the path within the object and returns the updated object

Args:
- `path` (text)
- `value` (any)

```
{"fizz":"buzz"}|set:"foo":"bar"   // {"fizz": "buzz","foo":"bar"}
```

### `set_conditional`

`any | any[] → any` — Sets a value at the path within the object and returns the updated object, if the conditional expression is true

Args:
- `path` (text)
- `value` (any)
- `conditional` (any)

```
{'fizz':'buzz'}|set_conditional:'foo':'bar':2==1+1   // {'fizz':'buzz','foo':'bar'}
```

### `set_ifnotempty`

`any | any[] → any` — Sets a value (if it is not empty: "", null, 0, "0", false, [], {}) at the path within the object and returns the updated object

Args:
- `path` (text)
- `value` (any)

```
{'fizz':'buzz'}|set_ifnotempty:'foo':'bar'   // {'fizz':'buzz','foo':'bar'}
```

### `set_ifnotnull`

`any | any[] → any` — Sets a value (if it is not null) at the path within the object and returns the updated object

Args:
- `path` (text)
- `value` (any)

```
{'fizz':'buzz'}|set_ifnotnull:'foo':'bar'   // {'fizz':'buzz','foo':'bar'}
```

### `first_notnull`

`any | any[] → any` — Returns the first value that is not null

Args:
- `value` (any)

```
null|first_notnull:0   // 0
```

### `first_notempty`

`any | any[] → any` — Returns the first value that is not empty - i.e. not ("", null, 0, "0", false, [], {})

Args:
- `value` (any)

```
""|first_notempty:1   // 1
```

### `unset`

`any | any[] → any` — Removes a value at the path within the object and returns the updated object

Args:
- `path` (text)

```
{'fizz':'buzz','foo':'bar'}|unset:'foo'   // {'fizz':'buzz'}
```

### `transform`

`any | any[] → any` — Processes an expression with local data bound to the $$ variable

Args:
- `expression` (text)

```
2|transform:$$+3   // 5
```

### `get`

`any | any[] → any` — Returns the value of an object at the specified path

Args:
- `path` (text)
- `default` (json, default `null`) — the default is used if no value is found at the path

```
{'fizz':'buzz'}|get:'fizz'   // "buzz"
```

### `has`

`any | any[] → bool` — Returns the existence of whether or not something is present in the object at the specified path

Args:
- `path` (text)

```
{'fizz':'buzz'}|has:'fizz'   // true
```

### `fill` (alias `array_fill`)

`any → any[]` — Create an array of a certain size with a default value.

Args:
- `start` (int, default `0`) — the starting index of the array.
- `count` (int) — the number of entries within the array.

```
"v"|array_fill:0:6   // ["v","v","v","v","v","v"]
```

### `fill_keys` (alias `array_fill_keys`)

`any → any[]` — Create an array of keys with a default value.

Args:
- `keys` (any[], default `[]`) — an array of keys.

```
key|array_fill_keys:["a","b","c"]   // {"a":"key","b":"key","c":"key"}
```

## Transform Filters

### `to_expr`

`any → any` — Converts text into an expression, processes it, and returns the result

```
"(2 + 1) % 2"|to_expr   // 1
```

### `to_text`

`int | decimal | bool → text` — Converts integer, decimal, or bool types to text and returns the result

```
1.344|to_text   // "1.344"
```

### `to_int`

`text | decimal | bool → int` — Converts text, decimal, or bool types to an integer and returns the result

```
"133.45 kg"|to_int   // 133
```

### `to_decimal`

`text | int | bool → decimal` — Converts text, integer, or bool types to a decimal and returns the result

```
"133.45 kg"|to_decimal   // 133.45
```

### `to_bool`

`text | int | decimal → bool` — Converts text, integer, or decimal types to a bool and returns the result

```
"true"|to_bool   // true
```

### `to_timestamp` (alias `to_epochms`)

`text | int → epochms` — Converts a text expression (now, next friday, Jan 1 2000) to timestamp compatible format.

Args:
- `timezone` (text, default `"UTC"`) — the timezone - E.g. UTC, America/Los_Angeles, Australia/Sydney

```
"next friday"|to_timestamp:"America/Los_Angeles"   // 1758265200000
```

### `to_ms` (alias `to_epoch_ms`)

`text | int → int` — Converts a text expression (now, next friday, Jan 1 2000) to the number of milliseconds since the unix epoch.

Args:
- `timezone` (text, default `"UTC"`) — the timezone - E.g. UTC, America/Los_Angeles, Australia/Sydney

```
"next friday"|to_ms:"America/Los_Angeles"   // 1758265200000
```

### `to_seconds` (alias `to_epoch_sec`)

`text | int → int` — Converts a text expression (now, next friday, Jan 1 2000) to the number of seconds since the unix epoch.

Args:
- `timezone` (text, default `"UTC"`) — the timezone - E.g. UTC, America/Los_Angeles, Australia/Sydney

```
"next friday"|to_seconds:"America/Los_Angeles"   // 1758265200
```

### `to_minutes` (alias `to_epoch_minute`)

`text | int → int` — Converts a text expression (now, next friday, Jan 1 2000) to the number of minutes since the unix epoch.

Args:
- `timezone` (text, default `"UTC"`) — the timezone - E.g. UTC, America/Los_Angeles, Australia/Sydney

```
"next friday"|to_minutes:"America/Los_Angeles"   // 29304420
```

### `to_hours` (alias `to_epoch_hour`)

`text | int → int` — Converts a text expression (now, next friday, Jan 1 2000) to the number of hours since the unix epoch.

Args:
- `timezone` (text, default `"UTC"`) — the timezone - E.g. UTC, America/Los_Angeles, Australia/Sydney

```
"next friday"|to_hours:"America/Los_Angeles"   // 488407
```

### `to_days` (alias `to_epoch_day`)

`text | int → int` — Converts a text expression (now, next friday, Jan 1 2000) to the number of days since the unix epoch.

Args:
- `timezone` (text, default `"UTC"`) — the timezone - E.g. UTC, America/Los_Angeles, Australia/Sydney

```
"next friday"|to_days:"America/Los_Angeles"   // 20350
```

### `create_object`

`<T>[] → any` — Creates an object based on a list of keys and a list of values

Args:
- `values` (<T>[], default `[]`) — a list of values

```
["a","b","c"]|create_object:[1,2,3]   // {"a":1,"b":2,"c":3}
```

### `create_object_from_entries`

`<T>[] → any` — Creates an object based on an array of key/value pairs. (i.e. same result as the entries filter)

```
[{key:"a",value:1},{key:"b",value:2},{key:"c",value:3}]|create_object_from_entries   // {"a":1,"b":2,"c":3}
```

### `json_decode`

`text | int | decimal | bool → any` — Decodes the value represented as json and returns the result

```
"{\"a\":1,\"b\":2,\"c\":3}"|json_decode   // {"a":1,"b":2,"c":3}
```

### `json_encode`

`<T> → text` — Encodes the value and returns the result as json text

```
{"a":1,"b":2,"c":3}|json_encode   // "{\"a\":1,\"b\":2,\"c\":3}"
```

### `xml_decode`

`text → any` — Decodes XML and returns the result

```
"<root><a>1</a><b>2</b><c>3</c></root>"|xml_decode   // {
  "root": {
    "@attributes": [],
    "value": [
      {
        "a": {
          "@attributes": [],
          "value": "1"
        }
      },
      {
        "b": {
          "@attributes": [],
          "value": "2"
        }
      }
    ]
  }
}
```

### `csv_parse`

`text → any` — Parse the contents of a CSV file and convert it into an array of objects.

Args:
- `separator` (text, default `","`) — the field deliminator - one character only (i.e. a comma)
- `enclosure` (text, default `"\""`) — the field enclosure - one character only (i.e. a quotation mark)
- `escape` (text, default `"\""`) — the escape value - used to allow using the enclosure field within the field

### `csv_decode`

`text → any` — Decodes the value represented in the CSV format and returns the result

Args:
- `separator` (text, default `","`) — the field deliminator - one character only (i.e. a comma)
- `enclosure` (text, default `"\""`) — the field enclosure - one character only (i.e. a quotation mark)
- `escape` (text, default `"\""`) — the escape value - used to allow using the enclosure field within the field

### `csv_encode`

`<T> → text` — Encodes the value and returns the result in CSV format

Args:
- `separator` (text, default `","`) — the field deliminator - one character only (i.e. a comma)
- `enclosure` (text, default `"\""`) — the field enclosure - one character only (i.e. a quotation mark)
- `escape` (text, default `"\""`) — the escape value - used to allow using the enclosure field within the field

### `csv_create`

`<T>[] → text` — Creates a CSV format data stream from a list of column names and their corresponding data rows.

Args:
- `rows` (text[]) — your rows of data
- `separator` (text, default `","`) — the field deliminator - one character only (i.e. a comma)
- `enclosure` (text, default `"\""`) — the field enclosure - one character only (i.e. a quotation mark)
- `escape` (text, default `"\""`) — the escape value - used to allow using the enclosure field within the field

### `url_decode`

`text → text` — Decodes the value represented as a url encoded value

```
"Hello%2C%20World%21"|url_decode   // "Hello, World!"
```

### `url_decode_rfc3986`

`text → text` — Decodes the value represented as a url encoded value using the RFC 3986 specification

```
"Hello%2C%20World%21"|url_decode_rfc3986   // "Hello, World!"
```

### `url_encode`

`text → text` — Encodes the value and returns the result as a url encoded value

```
"Hello, World!"|url_encode   // "Hello%2C%20World%21"
```

### `url_encode_rfc3986`

`text → text` — Encodes the value and returns the result as a url encoded value using the RFC 3986 specification

```
"Hello, World!"|url_encode_rfc3986   // "Hello%2C%20World%21"
```

### `yaml_decode`

`text | int | decimal | bool → obj` — Decodes the value represented as yaml and returns the result

```
"a: 1\nb: 2\nc: 3"|yaml_decode   // {"a":1,"b":2,"c":3}
```

### `yaml_encode`

`<T> → text` — Encodes the value and returns the result as yaml text

```
{"a":1,"b":2,"c":3}|yaml_encode   // "a: 1\nb: 2\nc: 3\n"
```

### `hex2bin`

`text → text` — Converts a hex value into its binary equivalent

```
"68656c6c6f"|hex2bin   // "hello"
```

### `bin2hex`

`text → text` — Converts a binary value into its hex equivalent

```
"hello"|bin2hex   // "68656c6c6f"
```

### `dechex`

`text → text` — Converts a decimal value into its hex equivalent

```
"255"|dechex   // "ff"
```

### `hexdec`

`text → text` — Converts a hex value into its decimal equivalent

```
"ff"|hexdec   // "255"
```

### `decbin`

`text → text` — Converts a decimal value into its binary string (i.e. 01010) equivalent

```
"10"|decbin   // "1010"
```

### `bindec`

`text → text` — Converts a binary string (i.e. 01010) into its decimal equivalent

```
"1010"|bindec   // "10"
```

### `decoct`

`text → text` — Converts a decimal value into its octal equivalent

```
"10"|decoct   // "12"
```

### `octdec`

`text → text` — Converts an octal value into its decimal equivalent

```
"12"|octdec   // "10"
```

### `base_convert`

`text → text` — Converts a value between two bases

Args:
- `from_base` (any) — the base of the original value
- `to_base` (any) — the base of the new converted value

```
"ff"|base_convert:16:10   // "255"
```

### `base64_decode`

`text → text` — Decodes the value represented as base64 text and returns the result

```
"aGVsbG8="|base64_decode   // "hello"
```

### `base64_encode`

`text → text` — Encodes the value and returns the result as base64 text

```
"hello"|base64_encode   // "aGVsbG8="
```

### `base64_decode_urlsafe`

`text → text` — Decodes the value represented as base64 urlsafe text and returns the result

```
"aGVsbG8_"|base64_decode_urlsafe   // "hello?"
```

### `base64_encode_urlsafe`

`text → text` — Encodes the value and returns the result as base64 urlsafe text

```
"hello?"|base64_encode_urlsafe   // "aGVsbG8_"
```

## Security Filters

### `encrypt`

`any → text` — Encrypts the value and returns the result in raw binary form.

Args:
- `algorithm` (enum, default `"aes-128-cbc"`) — the algorithm used for encryption
- `key` (text) — the key used for encryption
- `iv` (text) — the initialization vector

```
"hello"|encrypt:"aes-192-cbc":"1494AX6XJUsDe51kF9S9sA==":"27222b6032574bad"   // "���Z �r|5���~�l"
```

### `decrypt`

`any → text` — Decrypts the value and returns the result.

Args:
- `algorithm` (enum, default `"aes-128-cbc"`) — the algorithm used for decryption
- `key` (text) — the key used for decryption
- `iv` (text) — the initialization vector

```
"...encrypted..."|decrypt:"aes-192-cbc":"1494AX6XJUsDe51kF9S9sA==":"27222b6032574bad"   // "hello"
```

### `jws_encode` (alias `crypto_jws_encode`)

`any → text` — Encodes the value and return the result as a JWS token

Args:
- `headers` (json) — optional; headers to include in the JWS token
- `key` (json) — the key used for signing the JWS token
- `algorithm` (enum, default `"HS256"`) — the algorithm used for calculating the signature
- `ttl` (int, default `0`) — optional; the amount of time in seconds this token is valid - use 0 for no expiration.

```
"hello"|jws_encode:{sub: "1234567890",name: "John Doe",admin: true,iat: 1516239022}:"a-string-secret-at-least-256-bits-long":HS256   // "...encrypted..."
```

### `jws_decode` (alias `crypto_jws_decode`)

`any → json` — Decodes the JWS token and return the result

Args:
- `check_claims` (json) — optional; claims to enforce
- `key` (json) — the key used for verifying the authenticity of the JWS token
- `algorithm` (enum, default `"HS256"`) — the algorithm used for calculating the signature
- `timeDrift` (int, default `0`) — optional; if this token is time sensitive, then you can specify an allowable amount of time drift to be more tollerant of clocks not fully synchronized between servers.

```
"eyJzd...ZYw"|jws_decode:{}:"a-string-secret-at-least-256-bits-long":HS256   // "hello"
```

### `jwe_encode` (alias `crypto_jwe_encode`)

`any → text` — Encodes the value and return the result as a JWE token

Args:
- `headers` (json) — optional; headers to include in the JWS token
- `key` (json) — the key used for encrypting the JWE token
- `key_algorithm` (enum, default `"A256KW"`) — the algorithm used for encrypting the key used for content encyption
- `content_algorithm` (enum, default `"A256CBC-HS512"`) — the algorithm used for encrypting the content
- `ttl` (int, default `0`) — optional; the amount of time in seconds this token is valid - use 0 for no expiration.

```
"hello"|jwe_encode:{sub: "1234567890",name: "John Doe",admin: true,iat: 1516239022}:"a-string-secret-at-least-256-bits-long":"A256KW":"A256CBC-HS512"   // "...encrypted..."
```

### `jwe_decode` (alias `crypto_jwe_decode`)

`any → json` — Decodes the JWE token and return the result

Args:
- `check_claims` (json) — optional; claims to enforce
- `key` (json) — the key used for decrypting the key used for content decryption
- `key_algorithm` (enum, default `"A256KW"`) — the algorithm used for encrypting the key
- `content_algorithm` (enum, default `"A256CBC-HS512"`) — the algorithm used for encrypting the content
- `timeDrift` (int, default `0`) — optional; if this token is time sensitive, then you can specify an allowable amount of time drift to be more tollerant of clocks not fully synchronized between servers.

```
"eyJ...Xw"|jwe_decode:{}:"a-string-secret-at-least-256-bits-long":"A256KW":"A256CBC-HS512"   // "hello"
```

### `secureid_encode`

`int → text` — Returns an encrypted version of the id

Args:
- `salt` (text) — an optional salt

```
12345|secureid_encode:"my_salt"   // "ZlV3Lg.-0-UZyQ9xQk"
```

### `secureid_decode`

`text → int` — Returns the id of the original encode

Args:
- `salt` (text) — the salt of the original encode

```
"ZlV3Lg.-0-UZyQ9xQk"|secureid_decode:"my_salt"   // 12345
```

### `md5`

`text → text` — Returns a MD5 signature representation of the value

Args:
- `raw` (bool, default `false`) — Unchecked will be a hex value. Checked will be a raw binary value.

```
"some_message"|md5   // "af8a2aae147de3350f6c0f1a075ede5d"
```

### `sha1`

`text → text` — Returns a SHA1 signature representation of the value

Args:
- `raw` (bool, default `false`) — Unchecked will be a hex value. Checked will be a raw binary value.

```
"some_message"|sha1   // "33a374032... (truncated) ..."
```

### `sha256`

`text → text` — Returns a SHA256 signature representation of the value

Args:
- `raw` (bool, default `false`) — Unchecked will be a hex value. Checked will be a raw binary value.

```
"some_message"|sha256   // "6cc869f10009fa1... (truncated) ..."
```

### `sha384`

`text → text` — Returns a SHA384 signature representation of the value

Args:
- `raw` (bool, default `false`) — Unchecked will be a hex value. Checked will be a raw binary value.

```
"some_message"|sha384   // "17a7717060650457... (truncated) ..."
```

### `sha512`

`text → text` — Returns a SHA512 signature representation of the value

Args:
- `raw` (bool, default `false`) — Unchecked will be a hex value. Checked will be a raw binary value.

```
"some_message"|sha512   // "40aaa4e84e7d98e472d240f1c84298de... (truncated) ..."
```

### `hmac_md5`

`text → text` — Returns a MD5 signature representation of the value using a shared secret via the HMAC method

Args:
- `key` (text) — The shared secret
- `raw` (bool, default `false`) — Unchecked will be a hex value. Checked will be a raw binary value.

```
"some_message"|hmac_md5:MY_SECRET_KEY   // "c4c1007ea935001cc7734b360395fb1d"
```

### `hmac_sha1`

`text → text` — Returns a SHA1 signature representation of the value using a shared secret via the HMAC method

Args:
- `key` (text) — The shared secret
- `raw` (bool, default `false`) — Unchecked will be a hex value. Checked will be a raw binary value.

```
"some_message"|hmac_sha1:MY_SECRET_KEY   // "83b48df25eda2... (truncated) ..."
```

### `hmac_sha256`

`text → text` — Returns a SHA256 signature representation of the value using a shared secret via the HMAC method

Args:
- `key` (text) — The shared secret
- `raw` (bool, default `false`) — Unchecked will be a hex value. Checked will be a raw binary value.

```
"some_message"|hmac_sha256:MY_SECRET_KEY   // "3e18fc78d5326e5... (truncated) ..."
```

### `hmac_sha384`

`text → text` — Returns a SHA384 signature representation of the value using a shared secret via the HMAC method

Args:
- `key` (text) — The shared secret
- `raw` (bool, default `false`) — Unchecked will be a hex value. Checked will be a raw binary value.

```
"some_message"|hmac_sha384:MY_SECRET_KEY   // "60818f7b6e6... (truncated) ..."
```

### `hmac_sha512`

`text → text` — Returns a SHA512 signature representation of the value using a shared secret via the HMAC method

Args:
- `key` (text) — The shared secret
- `raw` (bool, default `false`) — Unchecked will be a hex value. Checked will be a raw binary value.

```
"some_message"|hmac_sha512:MY_SECRET_KEY   // "880c17f6d5fa9e1ea3b7... (truncated) ..."
```

### `uuid` (alias `uuid4`)

`any → text` — Returns a universally unique identifier

```
|uuid4   // "550e8400-e29b-41d4-a716-446655440000"
```

## Timestamp Filters

### `parse_timestamp` (alias `epochms_from_format`)

`int | text | epochms → text` — Parse a timestamp from a flexible format.

Args:
- `format` (text) — the format of the timestamp
- `timezone` (text, default `"UTC"`) — the timezone - E.g. UTC, America/Los_Angeles, Australia/Sydney

```
"2023-08-15 13:45:30"|parse_timestamp:"Y-m-d H:i:s":"America/Los_Angeles"   // "1692132330000"
```

### `format_timestamp` (alias `epochms_date`)

`int | text | epochms → text` — Converts a timestamp into a human readable formatted date based on the supplied format

Args:
- `format` (text) — the format of the resulting date text
- `timezone` (text, default `"UTC"`) — the timezone - E.g. UTC, America/Los_Angeles, Australia/Sydney

```
"1692132330000"|format_timestamp:"Y-m-d H:i:s":"America/New_York"   // "2023-08-15 16:45:30"
```

### `transform_timestamp` (alias `epochms_transform`)

`int | text | epochms → text` — Takes a timestamp and applies a relative transformation to it. Ex. -7 days, last Monday, first day of this month

Args:
- `format` (text) — the format of the transformation
- `timezone` (text, default `"UTC"`) — the timezone - E.g. UTC, America/Los_Angeles, Australia/Sydney

```
"2023-08-15T20:45:30.000Z"|transform_timestamp:"-7 days":"America/Los_Angeles"   // "1691527530000"
```

### `add_secs_to_timestamp` (alias `epochms_add_secs`)

`epochms → epochms` — Add seconds to a timestamp. (negative values are ok)

Args:
- `seconds` (int)

```
1691527530000|add_secs_to_timestamp:60   // 1691527590000
```

### `add_ms_to_timestamp` (alias `epochms_add_ms`)

`epochms → epochms` — Add milliseconds to a timestamp. (negative values are ok)

Args:
- `milliseconds` (int)

```
monday|add_ms_to_timestamp:500   // 1758499200500
```

## Related Topics

| Topic | Use For |
|-------|---------|
| [expressions](xano_xanoscript_docs({ topic: "expressions" })) | The expression language itself: operators, `$$` filters, anchoring variables, `set` |
| [syntax](xano_xanoscript_docs({ topic: "syntax" })) | XanoScript operators, filters, and backtick expression mode |
| [syntax/array-filters](xano_xanoscript_docs({ topic: "syntax/array-filters" })) | Expression vs lambda (JS) higher-order filters |
