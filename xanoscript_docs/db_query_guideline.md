# Xano Database Query Guidelines

## db.query

The `db.query` is the most used and the most flexible database query, it is used to retrieve data from your database (not unlike a SQL `SELECT` statement). It allows you to specify the table, filters, sorting, and pagination options.

### Search Argument

The `search` is the equivalent of a SQL `WHERE` clause. It allows you to filter records based on specific conditions. The list of available operators includes:

#### Basic Comparison Operators

Basic comparison operators are:

- `==` (equals)
- `!=` (not equals)
- `>` (greater than)
- `>=` (greater than or equal)
- `<` (less than)
- `<=` (less than or equal)

**Examples**
Tests if two values are equal.

```xs
db.query "post" {
  where = $db.post.user_id == $auth.id
} as $posts
```

Tests if two values are not equal.

```xs
db.query "post" {
  where = $db.post.status != "draft"
} as $published_posts
```

#### Array Content Operators

**`contains` (contains) and `not contains` (does not contain)**
Tests if an array contains a specific value.

IMPORTANT, DO NOT USE `icontains` IT IS NOT VALID IN A QUERY
use `contains` instead as it is case insensitive by default.

Tests if a field does not contain a specific value.

```xs
db.query "post" {
  description = "Posts without specific tags"
  where = $db.post.tags not contains "deprecated"
} as $current_posts
```

#### String Content Operators

**`includes` (includes)**
Tests if a string includes a particular phrase / value.

```xs
db.query "post" {
  description = "Posts with specific title content"
  where = $db.post.title includes "tutorial"
} as $tutorial_posts
```

#### Array Overlap Operators

**`overlaps` (overlaps) and `not overlaps` (does not overlap)**
Tests if two arrays have any elements in common. Useful for comparing array fields.

```xs
db.query "post" {
  description = "Posts with overlapping tags"
  where = $db.post.tags overlaps ["javascript", "react"]
} as $matching_posts
```

Tests if two arrays have no elements in common.

```xs
db.query "post" {
  description = "Posts without conflicting tags"
  where = $db.post.tags not overlaps ["outdated", "deprecated"]
} as $valid_posts
```

#### Combining Conditions

You can combine multiple conditions using logical operators:

**`&&` (logical AND)**

```xs
db.query "post" {
  where = $db.post.user_id == $auth.id && $db.post.status == "published"
} as $my_published_posts
```

**`||` (logical OR)**

```xs
db.query "post" {
  where = $db.post.user_id == $auth.id || $db.post.status == "published"
} as $my_published_posts
```

#### Ignore if null Operators

When filtering data, some condition might be optional based on user input. In such cases, you can use the `?` operator after the comparison operator (`==` would become `==?`) to ignore that condition if the value is null. For example, if you have an optional `category` input parameter, you can write:

```xs
db.query "post" {
  where = $db.post.category ==? $input.category
} as $filtered_posts
```

If you have a set of advanced search filters, you can use multiple ignore-if-null conditions:

```xs
db.query "post" {
  where = $db.post.category ==? $input.category && $db.post.status ==? $input.status && $db.post.created_at >=? $input.start_date && $db.post.created_at <=? $input.end_date
} as $filtered_posts
```

This way, if any of the input parameters are null, that specific condition will be ignored in the query.

### join

binding allows you to join related tables in your query. You can specify the relationship using the `bind` argument, which takes an array of objects defining the join conditions.

```xs
db.query "comment" {
  where = $db.post.user_id == $auth.id && $db.post.status == "published" && $db.post.created_at > ("now"|timestamp_add_days:-30)
  join = {
    post: {
      table  : "post"
      type  : "inner"
      where: $db.comment.post_id == $db.post.id
    }
  }
} as $my_published_posts
```

The joins can be of type `inner`, `left`, or `right`, depending on your needs.

Note that joining a table does not return its fields; it only allows you to use those fields in the `search` condition. If you wanted to return fields from the joined table, you would want to either use an `eval` to map some of the values retrieved from the join or use an `addon` which would fetch the related data separately.

### Addon

An Addon is a function that is running a single `db.query` statement to fetch related data for each record returned by the main query. This is useful for fetching related records without using joins. Note that only a single `db.query` statement is allowed in an addon stack, no other operations is allowed.

For example, if you wanted to fetch blog posts along with their likes and comments, you could use addons like this (assuming you have `blog_post_likes` and `blog_post_comments` addons defined):

```xs
db.query blog_post {
  where = $db.blog_post.author_id == $auth.id
  sort = {blog_post.publication_date: "desc"}
  return = {type: "list", paging: {page: 1, per_page: 25, totals: true}}
  addon = [
    {
      name : "blog_post_like_count"
      input: {blog_post_id: $output.id}
      as   : "items.like_count"
    }
    {
      name : "blog_post_comment_count"
      input: {blog_post_id: $output.id}
      as   : "items.comment_count"
    }
  ]
} as $posts
```

The `blog_post_like_count` addon could be defined as:

```xs
addon blog_post_like_count {
  input {
    uuid blog_post_id? {
      table = "blog_post"
    }
  }

  stack {
    db.query blog_post_like {
      where = $db.blog_post_like.blog_post_id == $input.blog_post_id
      return = {type: "count"}
    }
  }
}
```

and the `blog_post_comment_count` addon could be defined as:

```xs
addon blog_post_comment_count {
  input {
    uuid blog_post_id? {
      table = "blog_post"
    }
  }

  stack {
    db.query blog_post_comment {
      where = $db.blog_post_comment.blog_post_id == $input.blog_post_id
      return = {type: "count"}
    }
  }
}
```

### Eval

Eval allows you to create computed fields based on existing fields in your database (or joined tables). You can define these computed fields using the `eval` argument, which takes an array of objects specifying the computation.

```xs
db.query "blog_post" {
  join = {
    user: {table: "user", where: $db.post.user_id == $db.user.id}
  }

  where = $db.post.user_id == $auth.id
  eval = {status: $db.user.status, userName: $db.user.name}
  return = {type: "list"}
} as $posts
```

### Return types

- `count`: Returns the number of matching records.
- `exists`: Returns whether any matching records exist.
- `single`: Returns a single matching record.
- `list`: Returns a list of matching records.

#### Return List

This is the default format when none is specified. You can specify pagination, sorting, and whether to include metadata.

You can specify sorting :

```xs
db.query "blog_post_comment" {
  where = $db.blog_post_comment.user_id == $auth.id && $db.blog_post_comment.status == "published"
  sort = {post.created_at: "asc"}
  return = {type: "list"}
} as $my_published_posts
```

sorting can be `asc`, `desc` or `rand` (random order).

You can also specify pagination (and combine it with sorting):

```xs
db.query "blog_post_comment" {
  join = {
    post: {
      table : "blog_post"
      where: $db.blog_post_comment.post_id == $db.blog_post.id
    }
  }

  where = $db.blog_post_comment.user_id == $auth.id
  additional_where = $input.query
  sort = { blog_post.created_at: "asc" }
  return = { type: "list", paging: { page: $input.page, per_page: 25 } }
} as $my_published_posts
```

paging defines the default constant you want to use for pagination, while external_simple allows you to override those values (here $input parameters).

This pagination will move the results into a new structure as:

```json
{
  "itemsReceived": integer,
  "curPage": integer,
  "nextPage": integer,
  "prevPage": integer,
  "offset": integer,
  "perPage": integer,
  "items": [ ... ]
}
```

#### Return Single

Returns a single matching record. If multiple records match, only the first one is returned.

```xs
db.query "comment" {
  where = $db.comment.user_id == $auth.id
  return = {
    type: "single"
  }
} as $my_published_posts
```

#### Return Count

Returns the number of matching records as an integer.

```xs
db.query "comment" {
  where = $db.comment.user_id == $auth.id
  return = {
    type: "count"
  }
} as $post_count
```

#### Return Exists

Returns whether any matching records exist as a boolean.

```xs
db.query "comment" {
  where = $db.comment.user_id == $auth.id
  return = {
    type: "exists"
  }
} as $has_posts
```

### Other convenience query operations

#### db.get

Retrieving a single record by its primary key can be done using `db.get`:

```xs
db.get "follow" {
  field_name = "id"
  field_value = $input.follow_id
} as $follow_record
```

#### db.has

Checking for the existence of a record can be done using `db.has`:

```xs
db.has "category" {
  field_name = "id"
  field_value = $input.query
} as $category_exists
```

#### Modifying your table

Adding a new record can be done using `db.add`:

```xs
db.add "post" {
  data = {
    user_id  : $auth.id
    caption  : $input.caption
    image_url: $input.image_url
    status   : "draft"
  }
} as $new_post
```

Editing a record can be done using `db.patch` this is preferred method to update a record and when the payload is built dynamically since the data object also accepts a variable.

```xs
var $payload {
  value = {status: "active"}
}

conditional {
  if ($input.is_featured) {
    var.update $payload.featured {
      value = true
    }
  }

  else {
    var.update $payload.featured {
      value = false
    }
  }
}

db.patch cards {
  field_name = "id"
  field_value = $input.card_id
  data = $payload
} as $cards1
```

Editing a record can also be done using `db.edit`. This method does not accept a variable for the data object and requires the fields to be updated to be specified in place.

```xs
db.edit "post" {
  field_name = "id"
  field_value = $input.post_id
  data = {
    caption : input.value
    image_url: $input.image_url || $post.image_url
  }
} as $edited_post
```

Adding or editing (upsert) a record can be done using `db.add_or_edit`. In this case, if the `field_value` is empty, a new record will be created; otherwise, the existing record will be updated.

```xs
db.add_or_edit "category" {
  field_name = "name"
  field_value = "$input.category"
  data = {
    name: $input.name
  }
} as $category_record
```

#### db.del

Deleting a record can be done using `db.del` (notice how delete does not return the deleted record):

```xs
db.del "post" {
  field_name = "id"
  field_value = $input.post_id
}
```
