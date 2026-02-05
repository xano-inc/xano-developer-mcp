# XanoScript Expression Guidelines

This document provides a complete reference for all XanoScript expressions. Each entry includes a description, usage example, and expected result.

These expressions can be combined using the pipe `|` operator to create powerful data transformations.

```xs
var $foo {
  value = (10|add:5)|mul:2  # Result: 30
}
```

or applied on returned values

```xs
db.query "users" {
  ...
} as $username|first|get:"name"|to_upper
```

## Comparison

Comparison operators are used to compare two values. The result of a comparison is a boolean value, either `true` or `false`.

- **Example**: `$a == $b` → `true` if `$a` is equal to `$b`, `false` otherwise.
- **Example**: `$a != $b` → `true` if `$a` is not equal to `$b`, `false` otherwise.
- **Example**: `$a > $b` → `true` if `$a` is greater than `$b`, `false` otherwise.
- **Example**: `$a < $b` → `true` if `$a` is less than `$b`, `false` otherwise.
- **Example**: `$a >= $b` → `true` if `$a` is greater than or equal to `$b`, `false` otherwise.
- **Example**: `$a <= $b` → `true` if `$a` is less than or equal to `$b`, `false` otherwise.

```xs
var $is_equal {
  value = $input.a == $input.b
}
```

Comparison operators can be combined with additional expressions for more complex logic. When combining expressions, use parentheses to ensure the correct order of operations so filters are applied as intended.

```xs
var $is_greater {
  value = ($input.a|floor) > ($input.b|rad2deg|ceil)
}
```

Expressions can also be used in conditionals

```xs
conditional {
  if ($input.status == "active" && $input.age > 18) {
    debug.log { value = "Active adult" }
  } elseif ($input.status == "active" && $input.age <= 18) {
    debug.log { value = "Active minor" }
  } elseif ($input.status == "inactive" && $input.age > 18) {
    debug.log { value = "Inactive adult" }
  } else {
    debug.log { value = "Inactive minor" }
  }
}
```

## Math Expressions

- **deg2rad**  
  Convert degrees to radians.  
  Example: `180|deg2rad`  
  Result: `3.141592...`

- **rad2deg**  
  Convert radians to degrees.  
  Example: `3.141592|rad2deg`  
  Result: `180`

- **number_format**  
  Format a number with decimal and thousands separators.  
  Example: `31253212.141592|number_format:2:.:,`  
  Result: `"31,253,212.14"`

- **sin**  
  Calculates the sine of the supplied value in radians.  
  Example: `3.14159|sin`  
  Result: `0`

- **asin**  
  Calculates the arc sine of the supplied value in radians.  
  Example: `1|asin`  
  Result: `1.57079...`

- **asinh**  
  Calculates the inverse hyperbolic sine of the supplied value in radians.  
  Example: `1|asinh`  
  Result: `0.88137...`

- **cos**  
  Calculates the cosine of the supplied value in radians.  
  Example: `1|cos`  
  Result: `0.54030...`

- **acos**  
  Calculates the arc cosine of the supplied value in radians.  
  Example: `1|acos`  
  Result: `0`

- **acosh**  
  Calculates the inverse hyperbolic cosine of the supplied value in radians.  
  Example: `11.592|acosh`  
  Result: `3.14159...`

- **tan**  
  Calculates the tangent of the supplied value in radians.  
  Example: `0.785398|tan`  
  Result: `1`

- **atan**  
  Calculates the arc tangent of the supplied value in radians.  
  Example: `1|atan`  
  Result: `0.78539...`

- **atanh**  
  Calculates the inverse hyperbolic tangent of the supplied value in radians.  
  Example: `0.6666|atanh`  
  Result: `0.80470...`

- **floor**  
  Round a decimal down to its integer equivalent.  
  Example: `2.5|floor`  
  Result: `2`

- **ceil**  
  Round a decimal up to its integer equivalent.  
  Example: `2.5|ceil`  
  Result: `3`

- **round**  
  Round a decimal with optional precision.  
  Example: `2.5432|round:1`  
  Result: `3`

- **abs**  
  Returns the absolute value.  
  Example: `-10|abs`  
  Result: `10`

- **sqrt**  
  Returns the square root of the value.  
  Example: `9|sqrt`  
  Result: `3`

- **exp**  
  Returns the exponent of mathematical expression "e".  
  Example: `0|exp`  
  Result: `1`

- **log**  
  Returns the logarithm with a custom base.  
  Example: `2|log:2`  
  Result: `1`

- **log10**  
  Returns the Base-10 logarithm.  
  Example: `100|log10`  
  Result: `2`

- **ln**  
  Returns the natural logarithm.  
  Example: `10|ln`  
  Result: `2.30258...`

- **pow**  
  Returns the value raised to the power of exp.  
  Example: `10|pow:2`  
  Result: `100`

- **min**  
  Returns the min of the values of the array.  
  Example: `[1,2,3]|array_min`  
  Result: `1`

- **max**  
  Returns the max of the values of the array.  
  Example: `[1,2,3]|max`  
  Result: `3`

- **min**  
  Returns the min both values.  
  Example: `1|min:0`  
  Result: `0`

- **max**  
  Returns the max both values.  
  Example: `5|max:20`  
  Result: `20`

- **sum**  
  Returns the sum of the values of the array.  
  Example: `[1,2,3,4]|sum`  
  Result: `10`

- **avg**  
  Returns the average of the values of the array.  
  Example: `[1,2,3,4]|avg`  
  Result: `2.5`

- **product**  
  Returns the product of the values of the array.  
  Example: `[1,2,3,4]|product`  
  Result: `24`

- **add**  
  Add 2 values together and return the answer.  
  Example: `2|add:3`  
  Result: `5`

- **subtract**  
  Subtract 2 values together and return the answer.  
  Example: `2|subtract:3`  
  Result: `-1`

- **multiply**  
  Multiply 2 values together and return the answer.  
  Example: `2|multiply:3`  
  Result: `6`

- **modulus**  
  Modulus 2 values together and return the answer.  
  Example: `20|modulus:3`  
  Result: `2`

- **divide**  
  Divide 2 values together and return the answer.  
  Example: `20|divide:4`  
  Result: `5`

- **bitwise_and**  
  Bitwise AND 2 values together and return the answer.  
  Example: `7|bitwise_and:3`  
  Result: `3`

- **bitwise_or**  
  Bitwise OR 2 values together and return the answer.  
  Example: `7|bitwise_or:9`  
  Result: `15`

- **bitwise_xor**  
  Bitwise XOR 2 values together and return the answer.  
  Example: `7|bitwise_xor:9`  
  Result: `14`

## Array Expressions

- **first**  
  Get the first entry of an array.  
  Example: `["five","six","seven"]|first`  
  Result: `"five"`

- **last**  
  Get the last entry of an array.  
  Example: `["five","six","seven"]|last`  
  Result: `"seven"`

- **count**  
  Return the number of items in an object/array.  
  Example: `["five","six","seven"]|count`  
  Result: `3`

- **range**  
  Returns array of values between the specified start/stop.  
  Example: `|range:10:15`  
  Result: `[10,11,12,13,14,15]`

- **reverse**  
  Returns values of an array in reverse order.  
  Example: `[12,13,14,15]|reverse`  
  Result: `[15,14,13,12]`

- **unique**  
  Returns unique values of an array.  
  Example: `[12,13,13,12,11]|unique`  
  Result: `[12,13,11]`

- **safe_array**  
  Always returns an array. Uses the existing value if it is an array or creates an array of one element.  
  Example: `12|safe_array`  
  Result: `[12]`

- **flatten**  
  Flattens a multidimensional array into a single level array of values.  
  Example: `[1,[2,3],[[4,5]]]|flatten`  
  Result: `[1,2,3,4,5]`

- **filter_empty**  
  Returns a new array with only entries that are not empty ("", null, 0, "0", false, [], {}).  
  Example: `[{a:1, b:null}, {a:0, b:4}]|filter_empty:a`  
  Result: `[{a:1, b:null}]`

- **sort**  
  Sort an array of elements with an optional path inside the element.  
  Example: `[{v:"a", e:20}, {v:"z", e:10}]|sort:v:text:true`  
  Result: `[{v:"z", e:10}, {v:"a", e:20}]`

- **shuffle**  
  Shuffles the order of the entries in the array.  
  Example: `[1,2,3,4]|shuffle`  
  Result: `[3,2,4,1]`

- **diff**  
  Return the entries from the first array that are not in the second array. Only values are used for matching.  
  Example: `[1,2,3,4]|diff:[3,2]`  
  Result: `[1,4]`

- **diff_assoc**  
  Return the entries from the first array that are not in the second array. Values and keys are used for matching.  
  Example: `[{"a": "green"},{"b": "brown"},{"c":"blue"},"red"]|diff_assoc:[{"a":"green"}, "yellow", "red"]`  
  Result: `[{a: "green",b: "brown", "red"]`

- **intersect**  
  Return the entries from the first array that are also present in the second array. Only values are used for matching.  
  Example: `[1,2,3,4]|intersect:[3,2]`  
  Result: `[2,3]`

- **intersect_assoc**  
  Return the entries from the first array that are also present in the second array. Values and keys are used for matching.  
  Example: `[{"a": "green"},{"b": "brown"},{"c":"blue"},"red"]|intersect_assoc:[{"a":"green"},{"b":"yellow"},"blue","red"]`  
  Result: `[{a: "green",b: "brown", "red"]`

- **merge**  
  Merge the first level of elements of both arrays together and return the new array.  
  Example: `[1,2,3]|merge:["a","b","c"]`  
  Result: `[1,2,3,"a","b","c"]`

- **merge_recursive**  
  Merge the elements from all levels of both arrays together and return the new array.  
  Example: `{color:{favorite: ["red"]}}|merge_recursive:{color: {favorite: ["green","blue"]}}`  
  Result: `{"color":{"favorite": ["red","green","blue"]}}`

- **index_by**  
  Create a new array indexed off of the value of each item's path.  
  Example: `[{id:1,g:"x"},{id:2,g:"y"},{id:3,g:"x"}]|index_by:g`  
  Result: `{"x": [{"id":1,"g":"x"},{"id":3,"g":"x"}], "y": [{"id":2,"g":"y"}]}`

- **push**  
  Push an element on to the end of an array and return the new array.  
  Example: `[1,2,3]|push:"a"`  
  Result: `[1,2,3,"a"]`

- **pop**  
  Pops the last element of the array off and returns it.  
  Example: `[1,2,3]|pop`  
  Result: `3`

- **unshift**  
  Push an element to the beginning of an array and return the new array.  
  Example: `[1,2,3]|unshift:0`  
  Result: `[0,1,2,3]`

- **shift**  
  Shifts the first element of the array off and returns it.  
  Example: `[1,2,3]|shift`  
  Result: `1`

- **remove**  
  Remove any elements from the array that match the supplied value and then return the new array.  
  Example: `[{v:1},{v:2},{v:3}]|remove:{v:2}`  
  Result: `[{v:1},{v:3}]`

- **append**  
  Push an element on to the end of an array within an object and return the updated object.  
  Example: `[1,2,3]|append:4`  
  Result: `[1,2,3,4]`

- **prepend**  
  Push an element on to the beginning of an array within an object and return the updated object.  
  Example: `[1,2,3]|prepend:0`  
  Result: `[0,1,2,3]`

- **slice**  
  Extract a section from an array.  
  Example: `[1,2,3,4,5]|slice:2:2`  
  Result: `[3,4]`

- **map**  
  Creates a new array with the results of calling a provided function on every element in the calling array.  
  Example: `[{value: 2}, {value: 5}]|map:$$.value*2`  
  Result: `double each value => [4,10]`

- **filter**  
  Filters the elements of an array based on the code block returning true to keep the element or false to skip it.  
  Example: `[{value: 2}, {value: 5}]|filter:$$.value%2==0`  
  Result: `only even values => [{value:2}]`

- **some**  
  Checks if at least one element in the array passes the test implemented by the provided function.  
  Example: `[{value: 2}, {value: 5}]|some:$$.value%2==0`  
  Result: `at least one value is even => true`

- **every**  
  Checks if all elements in the array pass the test implemented by the provided function.  
  Example: `[{value: 2}, {value: 6}]|every:$$.value%2==0`  
  Result: `all values are even => true`

- **find**  
  Finds if all elements in the array pass the test implemented by the provided function.  
  Example: `[{id: 1}, {id: 2}, {id: 3}]|find:$$.id==2`  
  Result: `returns {id:2}`

- **findIndex**  
  Finds the index of the first element in the array that passes the test implemented by the provided function.  
  Example: `[{id: 1}, {id: 2}, {id: 3}]|findIndex:$$.id==2`  
  Result: `returns 1`

- **reduce**  
  Reduces the array to a single value using the code block to combine each element of the array.  
  Example: `[1,2,3,4,5]|reduce:$$+$result:10`  
  Result: `returns 25`

- **pick**  
  Pick keys from the object to create a new object of just those keys.  
  Example: `{a:1,b:2,c:3}|pick:[a,c]`  
  Result: `returns {a:1,c:3}`

- **unpick**  
  Remove keys from the object to create a new object of the remaining keys.  
  Example: `{a:1,b:2,c:3}|unpick:[a,c]`  
  Result: `returns {b:2}`

## String/Text Expressions

- **addslashes**  
  Adds a backslash to the following characters: single quote, double quote, backslash, and null character.  
  Example: `'he said "Hi!"'|addslashes`  
  Result: `"he said \\"Hi!\\""`

- **escape**  
  Converts special characters into their escaped variants. Ex: \t for tabs and \n for newlines.  
  Example: `'he said\n- "Hi!"'|escape`  
  Result: `"he said \\n-\\\"Hi!\\\""`

- **list_encodings**  
  List support character encodings.  
  Example: `|list_encodings`  
  Result: `["UTF-8", "ISO-8859-1", ...]`

- **detect_encoding**  
  Detect the character encoding of the supplied text.  
  Example: `"étude"|detect_encoding`  
  Result: `UTF-8`

- **to_utf8**  
  Convert the supplied text from its binary form (ISO-8859-1) to UTF-8.  
  Example: `"�tudes"|to_utf8`  
  Result: `"études"`

- **from_utf8**  
  Convert the supplied text from UTF-8 to its binary form (ISO-8859-1).  
  Example: `"études"|from_utf8`  
  Result: `"�tudes"`

- **convert_encoding**  
  Convert the character encoding of the supplied text.  
  Example: `"études"|convert_encoding:"ISO-8859-1":"UTF-8"`  
  Result: `"�tudes"`

- **to_lower**  
  Converts all characters to lower case and returns the result.  
  Example: `"Epic Battle"|to_lower`  
  Result: `"epic battle"`

- **to_upper**  
  Converts all characters to upper case and returns the result.  
  Example: `"Epic Battle"|to_upper`  
  Result: `"EPIC BATTLE"`

- **trim**  
  Trim whitespace or other characters from both sides and return the result.  
  Example: `"  Epic Battle  "|trim`  
  Result: `"Epic Battle"`

- **ltrim**  
  Trim whitespace or other characters from the left side and return the result.  
  Example: `"  Epic Battle  "|ltrim`  
  Result: `"Epic Battle  "`

- **rtrim**  
  Trim whitespace or other characters from the right return the result.  
  Example: `"  Epic Battle  "|rtrim`  
  Result: `"  Epic Battle"`

- **capitalize**  
  Converts the first letter of each word to a capital letter.  
  Example: `"epic battle"|capitalize`  
  Result: `"Epic Battle"`

- **substr**  
  Extracts a section of text.  
  Example: `"Epic Battle"|substr:5:6`  
  Result: `"Battle"`

- **split**  
  Splits text into an array of text and returns the result.  
  Example: `"Epic Battle"|split:" "`  
  Result: `["Epic","Battle"]`

- **join**  
  Joins an array into a text string via the separator and returns the result.  
  Example: `["Epic","Battle"]|join:" "`  
  Result: `"Epic Battle"`

- **array_slice**  
  Extract a section from an array.  
  Example: `[1,2,3,4,5]|array_slice:2:2`  
  Result: `[3,4]`

- **strlen**  
  Returns the number of characters.  
  Example: `"Epic Battle"|strlen`  
  Result: `11`

- **strip_html**  
  Removes HTML tags from a string.  
  Example: `"<p>Epic Battle</p>"|strip_html`  
  Result: `"Epic Battle"`

- **unaccent**  
  Removes accents from characters.  
  Example: `"études"|unaccent`  
  Result: `"etudes"`

- **index**  
  Returns the index of the case-sensitive expression or false if it can't be found.  
  Example: `"Epic Battle"|index:"Battle"`  
  Result: `5`

- **iindex**  
  Returns the index of the case-insensitive expression or false if it can't be found.  
  Example: `"Epic Battle"|iindex:"battle"`  
  Result: `5`

- **starts_with**  
  Returns whether or not the expression is present at the beginning.  
  Example: `"Epic Battle"|starts_with:"Epic"`  
  Result: `true`

- **istarts_with**  
  Returns whether or not the case-insensitive expression is present at the beginning.  
  Example: `"Epic Battle"|istarts_with:"epic"`  
  Result: `true`

- **ends_with**  
  Returns whether or not the expression is present at the end.  
  Example: `"Epic Battle"|ends_with:"Battle"`  
  Result: `true`

- **iends_with**  
  Returns whether or not the case-insensitive expression is present at the end.  
  Example: `"Epic Battle"|iends_with:"battle"`  
  Result: `true`

- **contains**  
  Returns whether or not the expression is found.  
  Example: `"Epic Battle"|contains:"Battle"`  
  Result: `true`

- **icontains**  
  Returns whether or not the case-insensitive expression is found.  
  Example: `"Epic Battle"|icontains:"battle"`  
  Result: `true`

- **concat**  
  Concatenates two values together.  
  Example: `"Hello" | concat:"World!":" - "`  
  Result: `"Hello - World!"`

- **sprintf**  
  Formats text with variable substitution.  
  Example: `"Hello %s, you have %d new messages"|sprintf:"Bob":5`  
  Result: `"Hello Bob, you have 5 new messages"`

- **replace**  
  Replace all occurrences of a text phrase with another.  
  Example: `"Hella World"|replace:"o":"a"`  
  Result: `"Hella Warld"`

- **regex_matches**  
  Tests if a regular expression matches the supplied subject text.  
  Example: `"/^a.*c$/"|regex_matches:"abbbbc"`  
  Result: `true`

- **regex_get_first_match**  
  Return the first set of matches performed by a regular expression on the supplied subject text.  
  Example: `"/(\\w+)@(\\w+).(\\w+)/"|regex_get_first_match:"test@example.com"`  
  Result: `["test@example.com","test","example","com"]`

- **regex_get_all_matches**  
  Return all matches performed by a regular expression on the supplied subject text.  
  Example: `"/\\b\\w+@\\w+.\\w+\\b/"|regex_get_all_matches:"test@example.com"`  
  Result: `[["test@example.com"]]`

- **regex_quote**  
  Update the supplied text value to be properly escaped for regular expressions.  
  Example: `"Hello. How are you?"|regex_quote:"/"`  
  Result: `"Hello\\. How are you\\?"`

- **regex_replace**  
  Perform a regular expression search and replace on the supplied subject text.  
  Example: `"/\\s+/"|regex_replace:"-":"Hello   World"`  
  Result: `"Hello-World"`

## Object/Manipulation Expressions

- **set**  
  Sets a value at the path within the object and returns the updated object.  
  Example: `{"fizz":"buzz"}|set:"foo":"bar"`  
  Result: `{"fizz": "buzz","foo":"bar"}`

- **set_conditional**  
  Sets a value at the path within the object and returns the updated object, if the conditional expression is true.  
  Example: `{'fizz':'buzz'}|set_conditional:'foo':'bar':2==1+1`  
  Result: `{'fizz':'buzz','foo':'bar'}`

- **set_ifnotempty**  
  Sets a value (if it is not empty: "", null, 0, "0", false, [], {}) at the path within the object and returns the updated object.  
  Example: `{'fizz':'buzz'}|set_ifnotempty:'foo':'bar'`  
  Result: `{'fizz':'buzz','foo':'bar'}`

- **set_ifnotnull**  
  Sets a value (if it is not null) at the path within the object and returns the updated object.  
  Example: `{'fizz':'buzz'}|set_ifnotnull:'foo':'bar'`  
  Result: `{'fizz':'buzz','foo':'bar'}`

- **first_notnull**  
  Returns the first value that is not null.  
  Example: `null|first_notnull:0`  
  Result: `0`

- **first_notempty**  
  Returns the first value that is not empty - i.e. not ("", null, 0, "0", false, [], {}).  
  Example: `""|first_notempty:1`  
  Result: `1`

- **unset**  
  Removes a value at the path within the object and returns the updated object.  
  Example: `{'fizz':'buzz','foo':'bar'}|unset:'foo'`  
  Result: `{'fizz':'buzz'}`

- **transform**  
   Processes an expression with local data bound to the $this variable.  
  Example: `2|transform:$$+3"` 
Result:`5`

- **get**  
  Returns the value of an object at the specified path.  
  Example: `{'fizz':'buzz'}|get:'fizz'`  
  Result: `"buzz"`

- **has**  
  Returns the existence of whether or not something is present in the object at the specified path.  
  Example: `{'fizz':'buzz'}|has:'fizz'`  
  Result: `true`

- **fill**  
  Create an array of a certain size with a default value.  
  Example: `"v"|fill:0:6`  
  Result: `["v","v","v","v","v","v"]`

- **fill_keys**  
  Create an array of keys with a default value.  
  Example: `key|fill_keys:["a","b","c"]`  
  Result: `{"a":"key","b":"key","c":"key"}`

- **keys**  
  Get the property keys of an object/array as a numerically indexed array.  
  Example: `{"a":1,"b":2,"c":3}|keys`  
  Result: `["a","b","c"]`

- **values**  
  Get the property values of an object/array as a numerically indexed array.  
  Example: `{"a":1,"b":2,"c":3}|values`  
  Result: `[1,2,3]`

- **entries**  
  Get the property entries of an object/array as a numerically indexed array of key/value pairs.  
  Example: `{"a":1,"b":2,"c":3}|entries`  
  Result: `[{key:"a",value:1},{key:"b",value:2},{key:"c",value:3}]`

- **create_object**  
  Creates an object based on a list of keys and a list of values.  
  Example: `["a","b","c"]|create_object:[1,2,3]`  
  Result: `{"a":1,"b":2,"c":3}`

- **create_object_from_entries**  
  Creates an object based on an array of key/value pairs. (i.e. same result as the entries filter).  
  Example: `[{key:"a",value:1},{key:"b",value:2},{key:"c",value:3}]|create_object_from_entries`  
  Result: `{"a":1,"b":2,"c":3}`

## Date/Time/Timestamp Expressions

- **to_timestamp**  
  Converts a text expression (now, next friday, Jan 1 2000) to timestamp compatible format.  
  Example: `"next friday"|to_timestamp:"America/Los_Angeles"`  
  Result: `1758265200000`

- **to_ms**  
  Converts a text expression (now, next friday, Jan 1 2000) to the number of milliseconds since the unix epoch.  
  Example: `"next friday"|to_ms:"America/Los_Angeles"`  
  Result: `1758265200000`

- **to_seconds**  
  Converts a text expression (now, next friday, Jan 1 2000) to the number of seconds since the unix epoch.  
  Example: `"next friday"|to_seconds:"America/Los_Angeles"`  
  Result: `1758265200`

- **to_minutes**  
  Converts a text expression (now, next friday, Jan 1 2000) to the number of minutes since the unix epoch.  
  Example: `"next friday"|to_minutes:"America/Los_Angeles"`  
  Result: `29304420`

- **to_hours**  
  Converts a text expression (now, next friday, Jan 1 2000) to the number of hours since the unix epoch.  
  Example: `"next friday"|to_hours:"America/Los_Angeles"`  
  Result: `488407`

- **to_days**  
  Converts a text expression (now, next friday, Jan 1 2000) to the number of days since the unix epoch.  
  Example: `"next friday"|to_days:"America/Los_Angeles"`  
  Result: `20350`

- **parse_timestamp**  
  Parse a timestamp from a flexible format.  
  Example: `"2023-08-15 13:45:30"|parse_timestamp:"Y-m-d H:i:s":"America/Los_Angeles"`  
  Result: `"1692132330000"`

- **format_timestamp**  
  Converts a timestamp into a human readable formatted date based on the supplied format.  
  Example: `"1692132330000"|format_timestamp:"Y-m-d H:i:s":"America/New_York"`  
  Result: `"2023-08-15 16:45:30"`

- **transform_timestamp**  
  Takes a timestamp and applies a relative transformation to it. Ex. -7 days, last Monday, first day of this month.  
  Example: `"2023-08-15T20:45:30.000Z"|transform_timestamp:"-7 days":"America/Los_Angeles"`  
  Result: `"1691527530000"`

- **add_secs_to_timestamp**  
  Add seconds to a timestamp. (negative values are ok)  
  Example: `1691527530000|add_secs_to_timestamp:60`  
  Result: `1691527590000`

- **add_ms_to_timestamp**  
  Add milliseconds to a timestamp. (negative values are ok)  
  Example: `monday|add_ms_to_timestamp:500`  
  Result: `1758499200500`

## Comparison/Logical Expressions

- **equals**  
  Returns a boolean if both values are equal.  
  Example: `4|equals:4`  
  Result: `true`

- **not_equals**  
  Returns a boolean if both values are not equal.  
  Example: `4|not_equals:4`  
  Result: `false`

- **greater_than**  
  Returns a boolean if the left value is greater than the right value.  
  Example: `4|greater_than:2`  
  Result: `true`

- **greater_than_or_equal**  
  Returns a boolean if the left value is greater than or equal to the right value.  
  Example: `4|greater_than_or_equal:2`  
  Result: `true`

- **less_than**  
  Returns a boolean if the left value is less than the right value.  
  Example: `4|less_than:2`  
  Result: `false`

- **less_than_or_equal**  
  Returns a boolean if the left value is less than or equal to the right value.  
  Example: `4|less_than_or_equal:2`  
  Result: `false`

- **odd**  
  Returns whether or not the value is odd.  
  Example: `4|odd`  
  Result: `false`

- **even**  
  Returns whether or not the value is even.  
  Example: `4|even`  
  Result: `true`

- **in**  
  Returns whether or not the value is in the array.  
  Example: `[1,2,3]|in:3`  
  Result: `true`

- **not**  
  Returns the opposite of the existing value evaluated as a boolean.  
  Example: `true|not`  
  Result: `false`

- **bitwise_not**  
  Returns the existing value with its bits flipped.  
  Example: `8|bitwise_not`  
  Result: `-9`

- **is_null**  
  Returns whether or not the value is null.  
  Example: `8|is_null`  
  Result: `false`

- **is_empty**  
  Returns whether or not the value is empty ("", null, 0, "0", false, [], {}).  
  Example: `[]|is_empty`  
  Result: `true`

- **is_object**  
  Returns whether or not the value is an object.  
  Example: `{id:2, value:3, size:4}|is_object`  
  Result: `true`

- **is_array**  
  Returns whether or not the value is a numerical indexed array.  
  Example: `[1,2,3]|is_array`  
  Result: `true`

- **is_int**  
  Returns whether or not the value is an integer.  
  Example: `123|is_int`  
  Result: `true`

- **is_decimal**  
  Returns whether or not the value is a decimal value.  
  Example: `123.45|is_decimal`  
  Result: `true`

- **is_bool**  
  Returns whether or not the value is a boolean.  
  Example: `false|is_bool`  
  Result: `true`

- **is_text**  
  Returns whether or not the value is text.  
  Example: `"213"|is_text`  
  Result: `true`

## Security/Crypto Expressions

- **encrypt**  
  Encrypts the value and returns the result in raw binary form.  
  Example: `"hello"|encrypt:"aes-192-cbc":"1494AX6XJUsDe51kF9S9sA==":"27222b6032574bad"`  
  Result: `"���Z �r|5���~�l"`

- **decrypt**  
  Decrypts the value and returns the result.  
  Example: `"...encrypted..."|decrypt:"aes-192-cbc":"1494AX6XJUsDe51kF9S9sA==":"27222b6032574bad"`  
  Result: `"hello"`

- **jws_encode**  
  Encodes the value and returns the result as a JWS token.  
  Example: `"hello"|jws_encode:{sub: "1234567890",name: "John Doe",admin: true,iat: 1516239022}:"a-string-secret-at-least-256-bits-long":HS256`  
  Result: `"...encrypted..."`

- **jws_decode**  
  Decodes the JWS token and returns the result.  
  Example: `"eyJzd...ZYw"|jws_decode:{}:"a-string-secret-at-least-256-bits-long":HS256`  
  Result: `"hello"`

- **jwe_encode**  
  Encodes the value and returns the result as a JWE token.  
  Example: `"hello"|jwe_encode:{sub: "1234567890",name: "John Doe",admin: true,iat: 1516239022}:"a-string-secret-at-least-256-bits-long":"A256KW":"A256CBC-HS512"`  
  Result: `"...encrypted..."`

- **jwe_decode**  
  Decodes the JWE token and returns the result.  
  Example: `"eyJ...Xw"|jwe_decode:{}:"a-string-secret-at-least-256-bits-long":"A256KW":"A256CBC-HS512"`  
  Result: `"hello"`

- **secureid_encode**  
  Returns an encrypted version of the id.  
  Example: `12345|secureid_encode:"my_salt"`  
  Result: `"ZlV3Lg.-0-UZyQ9xQk"`

- **secureid_decode**  
  Returns the id of the original encode.  
  Example: `"ZlV3Lg.-0-UZyQ9xQk"|secureid_decode:"my_salt"`  
  Result: `12345`

- **md5**  
  Returns a MD5 signature representation of the value.  
  Example: `"some_message"|md5`  
  Result: `"af8a2aae147de3350f6c0f1a075ede5d"`

- **sha1**  
  Returns a SHA1 signature representation of the value.  
  Example: `"some_message"|sha1`  
  Result: `"33a374032... (truncated) ..."`

- **sha256**  
  Returns a SHA256 signature representation of the value.  
  Example: `"some_message"|sha256`  
  Result: `"6cc869f10009fa1... (truncated) ..."`

- **sha384**  
  Returns a SHA384 signature representation of the value.  
  Example: `"some_message"|sha384`  
  Result: `"17a7717060650457... (truncated) ..."`

- **sha512**  
  Returns a SHA512 signature representation of the value.  
  Example: `"some_message"|sha512`  
  Result: `"40aaa4e84e7d98e472d240f1c84298de... (truncated) ..."`

- **hmac_md5**  
  Returns a MD5 signature representation of the value using a shared secret via the HMAC method.  
  Example: `"some_message"|hmac_md5:MY_SECRET_KEY`  
  Result: `"c4c1007ea935001cc7734b360395fb1d"`

- **hmac_sha1**  
  Returns a SHA1 signature representation of the value using a shared secret via the HMAC method.  
  Example: `"some_message"|hmac_sha1:MY_SECRET_KEY`  
  Result: `"83b48df25eda2... (truncated) ..."`

- **hmac_sha256**  
  Returns a SHA256 signature representation of the value using a shared secret via the HMAC method.  
  Example: `"some_message"|hmac_sha256:MY_SECRET_KEY`  
  Result: `"3e18fc78d5326e5... (truncated) ..."`

- **hmac_sha384**  
  Returns a SHA384 signature representation of the value using a shared secret via the HMAC method.  
  Example: `"some_message"|hmac_sha384:MY_SECRET_KEY`  
  Result: `"60818f7b6e6... (truncated) ..."`

- **hmac_sha512**  
  Returns a SHA512 signature representation of the value using a shared secret via the HMAC method.  
  Example: `"some_message"|hmac_sha512:MY_SECRET_KEY`  
  Result: `"880c17f6d5fa9e1ea3b7... (truncated) ..."`

- **create_uid**  
  Returns a unique 64bit unsigned int value seeded off the value.  
  Example: `|create_uid`  
  Result: `14567891234567890`

- **uuid**  
  Returns a universally unique identifier.  
  Example: `|uuid`  
  Result: `"550e8400-e29b-41d4-a716-446655440000"`

## Transform/Type Conversion Expressions

- **to_expr**  
  Converts text into an expression, processes it, and returns the result.  
  Example: `"(2 + 1) % 2"|to_expr`  
  Result: `1`

- **to_text**  
  Converts integer, decimal, or bool types to text and returns the result.  
  Example: `1.344|to_text`  
  Result: `"1.344"`

- **to_int**  
  Converts text, decimal, or bool types to an integer and returns the result.  
  Example: `"133.45 kg"|to_int`  
  Result: `133`

- **to_decimal**  
  Converts text, integer, or bool types to a decimal and returns the result.  
  Example: `"133.45 kg"|to_decimal`  
  Result: `133.45`

- **to_bool**  
  Converts text, integer, or decimal types to a bool and returns the result.  
  Example: `"true"|to_bool`  
  Result: `true`

- **json_decode**  
  Decodes the value represented as json and returns the result.  
  Example: `'{"a":1,"b":2,"c":3}'|json_decode`  
  Result: `{"a":1,"b":2,"c":3}`

- **json_encode**  
  Encodes the value and returns the result as json text.  
  Example: `{"a":1,"b":2,"c":3}|json_encode`  
  Result: `'{"a":1,"b":2,"c":3}'`

- **xml_decode**  
  Decodes XML and returns the result.  
  Example: `"<root><a>1</a><b>2</b><c>3</c></root>"|xml_decode`  
  Result: `{ "root": { "@attributes": [], "value": [ { "a": { "@attributes": [], "value": "1" } }, { "b": { "@attributes": [], "value": "2" } } ] } }`

- **yaml_decode**  
  Decodes the value represented as yaml and returns the result.  
  Example: `"a: 1\nb: 2\nc: 3"|yaml_decode`  
  Result: `{"a":1,"b":2,"c":3}`

- **yaml_encode**  
  Encodes the value and returns the result as yaml text.  
  Example: `{"a":1,"b":2,"c":3}|yaml_encode`  
  Result: `'a: 1\nb: 2\nc: 3\n'`

- **hex2bin**  
  Converts a hex value into its binary equivalent.  
  Example: `"68656c6c6f"|hex2bin`  
  Result: `"hello"`

- **bin2hex**  
  Converts a binary value into its hex equivalent.  
  Example: `"hello"|bin2hex`  
  Result: `"68656c6c6f"`

- **dechex**  
  Converts a decimal value into its hex equivalent.  
  Example: `"255"|dechex`  
  Result: `"ff"`

- **hexdec**  
  Converts a hex value into its decimal equivalent.  
  Example: `"ff"|hexdec`  
  Result: `"255"`

- **decbin**  
  Converts a decimal value into its binary string (i.e. 01010) equivalent.  
  Example: `"10"|decbin`  
  Result: `"1010"`

- **bindec**  
  Converts a binary string (i.e. 01010) into its decimal equivalent.  
  Example: `"1010"|bindec`  
  Result: `"10"`

- **decoct**  
  Converts a decimal value into its octal equivalent.  
  Example: `"10"|decoct`  
  Result: `"12"`

- **octdec**  
  Converts an octal value into its decimal equivalent.  
  Example: `"12"|octdec`  
  Result: `"10"`

- **base_convert**  
  Converts a value between two bases.  
  Example: `"ff"|base_convert:16:10`  
  Result: `"255"`

- **base64_decode**  
  Decodes the value represented as base64 text and returns the result.  
  Example: `"aGVsbG8="|base64_decode`  
  Result: `"hello"`

- **base64_encode**  
  Encodes the value and returns the result as base64 text.  
  Example: `"hello"|base64_encode`  
  Result: `"aGVsbG8="`

- **base64_decode_urlsafe**  
  Decodes the value represented as base64 urlsafe text and returns the result.  
  Example: `"aGVsbG8_"|base64_decode_urlsafe`  
  Result: `"hello?"`

- **base64_encode_urlsafe**  
  Encodes the value and returns the result as base64 urlsafe text.  
  Example: `"hello?"|base64_encode_urlsafe`  
  Result: `"aGVsbG8_"`

- **url_decode**  
  Decodes the value represented as a url encoded value.  
  Example: `"Hello%2C%20World%21"|url_decode`  
  Result: `"Hello, World!"`

- **url_decode_rfc3986**  
  Decodes the value represented as a url encoded value using the RFC 3986 specification.  
  Example: `"Hello%2C%20World%21"|url_decode_rfc3986`  
  Result: `"Hello, World!"`

- **url_encode**  
  Encodes the value and returns the result as a url encoded value.  
  Example: `"Hello, World!"|url_encode`  
  Result: `"Hello%2C%20World%21"`

- **url_encode_rfc3986**  
  Encodes the value and returns the result as a url encoded value using the RFC 3986 specification.  
  Example: `"Hello, World!"|url_encode_rfc3986`  
  Result: `"Hello%2C%20World%21"`
