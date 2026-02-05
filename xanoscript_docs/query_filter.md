# covers

Determines if one geometry covers another.

```xs
db.location.geometry|covers:$input.target_geometry
```

Returns `true` if the geometry covers the target geometry, `false` otherwise.

# l1_distance_manhattan

Provides the L1 (Manhattan) distance between two vectors.

```xs
db.embedding.vector|l1_distance_manhattan:$input.query_vector
```

Calculates the Manhattan distance between two numeric arrays.

# l2_distance_euclidean

Provides the L2 (Euclidean) distance between two vectors.

```xs
db.embedding.vector|l2_distance_euclidean:$input.query_vector
```

Calculates the Euclidean distance between two numeric arrays.

# inner_product

Provides the inner product between two vectors.

```xs
db.embedding.vector|inner_product:$input.query_vector
```

Calculates the dot product between two numeric arrays.

# negative_inner_product

Provides the negative inner product between two vectors.

```xs
db.embedding.vector|negative_inner_product:$input.query_vector
```

Calculates the negative dot product between two numeric arrays.

# cosine_distance

Provides the cosine distance between two vectors.

```xs
db.embedding.vector|cosine_distance:$input.query_vector
```

Calculates the cosine distance (1 - cosine similarity) between two numeric arrays.

# cosine_similarity

Provides the cosine similarity between two vectors.

```xs
db.embedding.vector|cosine_similarity:$input.query_vector
```

Calculates the cosine similarity between two numeric arrays.

# distance

Provides the distance in meters between two geometries.

```xs
db.location.geometry|distance:$input.target_geometry
```

Returns the distance between two geometric objects in meters.

# within

Determines if one geometry is within the supplied radius of another geometry.

```xs
db.location.geometry|within:$input.target_geometry:1000
```

Returns `true` if the geometry is within 1000 meters of the target geometry.

# between

Determines if a value is between 2 other values.

```xs
db.product.price|between:10:100
```

Returns `true` if the price is between 10 and 100, inclusive.

# length

Returns the number of items in an array.

```xs
db.user.tags|length
```

If tags contains `["admin", "user", "guest"]`, the result will be: `3`

# floor

Rounds fractions down to their integer equivalent.

```xs
db.bank_account.balance|floor
```

If the balance is `123.45`, the result will be: `123`

# ceil

Rounds fractions up to their integer equivalent.

```xs
db.bank_account.balance|ceil
```

If the balance is `123.45`, the result will be: `124`

# round

Rounds the value to the specified precision. If no precision is specified, it defaults to `2`.

```xs
db.bank_account.balance|round:1
```

If the balance is `123.45`, the result will be: `123.5`

# to_lower

Converts all characters to lower case and returns the result.

```xs
db.user.name|to_lower
```

If name is `"John DOE"`, the result will be: `"john doe"`

# to_upper

Converts all characters to upper case and returns the result.

```xs
db.user.name|to_upper
```

If name is `"John Doe"`, the result will be: `"JOHN DOE"`

# concat

Concatenates two values together.

```xs
db.user.first_name|concat:" "|concat:db.user.last_name
```

If first_name is `"John"` and last_name is `"Doe"`, the result will be: `"John Doe"`

# substr

Extracts a section of text.

```xs
db.user.email|substr:0:5
```

If email is `"john@example.com"`, the result will be: `"john@"`

# coalesce

Provides an alternative value for null values.

```xs
db.user.nickname|coalesce:db.user.first_name
```

If nickname is `null` and first_name is `"John"`, the result will be: `"John"`

# unaccent

Removes accents (eg é → e, ñ → n, ö → o) from characters.

```xs
db.user.name|unaccent
```

If name is `"José María"`, the result will be: `"Jose Maria"`

# add

Adds 2 values together and returns the answer.

```xs
db.product.price|add:5.99
```

If price is `10.00`, the result will be: `15.99`

# sub

Subtracts 2 values together and returns the answer.

```xs
db.product.price|sub:2.50
```

If price is `10.00`, the result will be: `7.50`

# mul

Multiplies 2 values together and returns the answer.

```xs
db.product.price|mul:1.2
```

If price is `10.00`, the result will be: `12.00`

# div

Divides 2 values together and returns the answer.

```xs
db.product.price|div:2
```

If price is `10.00`, the result will be: `5.00`

# search_rank

Calculate a ranking value for the search match.

```xs
db.article.content|search_rank:$input.search_term
```

Returns a decimal value representing the relevance ranking of the search match.

# timestamp_month

Get month from timestamp.

```xs
db.event.created_at|timestamp_month
```

Returns the month (1-12) from the timestamp. Optional timezone parameter defaults to UTC.

# timestamp_year

Get year from timestamp.

```xs
db.event.created_at|timestamp_year:"EST"
```

Returns the year from the timestamp. Optional timezone parameter defaults to UTC.

# timestamp_week

Get week from timestamp.

```xs
db.event.created_at|timestamp_week
```

Returns the week number (1-53) from the timestamp. Optional timezone parameter defaults to UTC.

# timestamp_hour

Get hour from timestamp.

```xs
db.event.created_at|timestamp_hour
```

Returns the hour (0-23) from the timestamp. Optional timezone parameter defaults to UTC.

# timestamp_minute

Get minute from timestamp.

```xs
db.event.created_at|timestamp_minute
```

Returns the minute (0-59) from the timestamp. Optional timezone parameter defaults to UTC.

# timestamp_day_of_month

Get day of month from timestamp.

```xs
db.event.created_at|timestamp_day_of_month
```

Returns the day of the month (1-31) from the timestamp. Optional timezone parameter defaults to UTC.

# timestamp_day_of_week

Get day of week from timestamp.

```xs
db.event.created_at|timestamp_day_of_week
```

Returns the day of the week (0-6, where 0 is Sunday) from the timestamp. Optional timezone parameter defaults to UTC.

# timestamp_day_of_year

Get day of year from timestamp.

```xs
db.event.created_at|timestamp_day_of_year
```

Returns the day of the year (1-366) from the timestamp. Optional timezone parameter defaults to UTC.

# timestamp_epoch_day

Get the number of days since the unix epoch.

```xs
db.event.created_at|timestamp_epoch_day
```

Returns the number of days since January 1, 1970.

# timestamp_epoch_hour

Get the number of hours since the unix epoch.

```xs
db.event.created_at|timestamp_epoch_hour
```

Returns the number of hours since January 1, 1970.

# timestamp_epoch_minute

Get the number of minutes since the unix epoch.

```xs
db.event.created_at|timestamp_epoch_minute
```

Returns the number of minutes since January 1, 1970.

# timestamp_epoch_sec

Get the number of seconds since the unix epoch.

```xs
db.event.created_at|timestamp_epoch_sec
```

Returns the number of seconds since January 1, 1970.

# timestamp_add_seconds

Add a number of seconds to the timestamp.

```xs
db.event.created_at|timestamp_add_seconds:30
```

Adds 30 seconds to the timestamp. Defaults to adding 1 second if no amount is specified.

# timestamp_subtract_seconds

Subtract a number of seconds from the timestamp.

```xs
db.event.created_at|timestamp_subtract_seconds:30
```

Subtracts 30 seconds from the timestamp. Defaults to subtracting 1 second if no amount is specified.

# timestamp_add_minutes

Add a number of minutes to the timestamp.

```xs
db.event.created_at|timestamp_add_minutes:15
```

Adds 15 minutes to the timestamp. Defaults to adding 1 minute if no amount is specified.

# timestamp_subtract_minutes

Subtract a number of minutes from the timestamp.

```xs
db.event.created_at|timestamp_subtract_minutes:15
```

Subtracts 15 minutes from the timestamp. Defaults to subtracting 1 minute if no amount is specified.

# timestamp_add_hours

Add a number of hours to the timestamp.

```xs
db.event.created_at|timestamp_add_hours:2
```

Adds 2 hours to the timestamp. Defaults to adding 1 hour if no amount is specified.

# timestamp_subtract_hours

Subtract a number of hours from the timestamp.

```xs
db.event.created_at|timestamp_subtract_hours:2
```

Subtracts 2 hours from the timestamp. Defaults to subtracting 1 hour if no amount is specified.

# timestamp_add_days

Add a number of days to the timestamp.

```xs
db.event.created_at|timestamp_add_days:7
```

Adds 7 days to the timestamp. Defaults to adding 1 day if no amount is specified.

# timestamp_subtract_days

Subtract a number of days from the timestamp.

```xs
db.event.created_at|timestamp_subtract_days:7
```

Subtracts 7 days from the timestamp. Defaults to subtracting 1 day if no amount is specified.

# timestamp_add_months

Add a number of months to the timestamp.

```xs
db.event.created_at|timestamp_add_months:3
```

Adds 3 months to the timestamp. Defaults to adding 1 month if no amount is specified.

# timestamp_subtract_months

Subtract a number of months from the timestamp.

```xs
db.event.created_at|timestamp_subtract_months:3
```

Subtracts 3 months from the timestamp. Defaults to subtracting 1 month if no amount is specified.

# timestamp_add_years

Add a number of years to the timestamp.

```xs
db.event.created_at|timestamp_add_years:1
```

Adds 1 year to the timestamp. Defaults to adding 1 year if no amount is specified.

# timestamp_subtract_years

Subtract a number of years from the timestamp.

```xs
db.event.created_at|timestamp_subtract_years:1
```

Subtracts 1 year from the timestamp. Defaults to subtracting 1 year if no amount is specified.
