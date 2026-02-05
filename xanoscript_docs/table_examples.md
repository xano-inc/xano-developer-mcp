---
applyTo: "tables/*.xs"
---

# Xanoscript Table Examples

Below are some examples of tables defined in Xanoscript.

## inventory_management_table

```xs
table "inventory_item" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the inventory item"
    }

    text name filters=trim {
      description = "Name of the inventory item"
    }

    text description filters=trim {
      description = "Detailed description of the inventory item"
      sensitive = true
    }

    decimal price? filters=min:0 {
      description = "Price of the inventory item in decimal format"
    }

    int stock_quantity? filters=min:0 {
      description = "Current quantity of the item in stock"
    }

    int[] category_ids {
      table = "category"
      description = "Foreign key reference to the product categories"
    }

    timestamp last_updated?=now {
      description = "Timestamp when the inventory record was last updated"
    }

    timestamp created_at?=now {
      description = "Timestamp when the inventory item was created"
    }

    json item_properties? {
      description = "Additional properties stored as JSON (color, size, weight, etc.)"
    }

    text sku filters=trim {
      description = "Stock Keeping Unit - unique product identifier"
    }

    decimal cost? filters=min:0 {
      description = "Cost price of the item for internal calculations"
    }

    int reorder_level? filters=min:0 {
      description = "Minimum stock level that triggers reorder alerts"
    }

    bool is_active?=1 {
      description = "Indicates whether the item is currently active in inventory"
    }

    text supplier_name? filters=trim {
      description = "Name of the primary supplier for this item"
    }

    text location? filters=trim {
      description = "Physical location/warehouse section where item is stored"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "name", op: "asc"}]}
    {type: "btree|unique", field: [{name: "sku", op: "asc"}]}
    {type: "btree", field: [{name: "stock_quantity", op: "asc"}]}
    {type: "btree", field: [{name: "last_updated", op: "desc"}]}
    {type: "btree", field: [{name: "is_active", op: "asc"}]}
    {type: "gin", field: [{name: "item_properties"}]}
    {type: "btree", field: [{name: "reorder_level", op: "asc"}]}
  ]
}
```

## shopping_cart_items_table

```xs
table "shopping_cart_items" {
  auth = false
  schema {
    int id {
      description = "Unique identifier for the cart item"
    }

    int user_id {
      table = "user"
      description = "ID of the user who owns the cart"
    }

    int product_id {
      table = "product"
      description = "ID of the product added to the cart"
    }

    int quantity filters=min:0 {
      description = "Quantity of the product in the cart (non-negative)"
    }

    decimal unit_price filters=min:0 {
      description = "Unit price of the product (non-negative)"
    }

    timestamp last_updated?=now {
      description = "Timestamp of the last update to the cart item"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree"
      field: [{name: "user_id"}, {name: "product_id"}]
    }
  ]
}
```

## weekly_slack_pets_prompt

```xs
table "slack_prompts" {
  auth = false
  schema {
    int id {
      description = "Identifier for the Slack prompt"
    }

    text prompt filters=trim {
      description = "The Slack prompt message to be sent"
    }

    bool is_used? {
      description = "Boolean flag indicating whether this prompt has been used"
    }

    text gif_url filters=trim {
      description = "URL of the GIF file to be sent with the prompt"
    }

    timestamp created_at?=now {
      description = "Timestamp when the prompt was created"
    }

    timestamp used_at? {
      description = "Timestamp when the prompt was last used"
    }

    enum type? {
      values = ["pets"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "is_used", op: "asc"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
```

## orders_table

```xs
table "orders" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the order"
    }

    decimal order_total filters=min:0 {
      description = "Total amount for the order"
    }

    timestamp order_date?=now {
      description = "Date and time when the order was placed"
    }

    bool is_fulfilled? {
      description = "Indicates whether the order has been fulfilled"
    }

    int customer_id? {
      table = "customer"
    }

    enum order_status? {
      values = [
        "draft"
        "confirmed"
        "fulfilling"
        "shipping"
        "delivered"
        "returned"
      ]
    }
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}
```

## payment_transaction

```xs
table "payment_transactions" {
  description = "Table to store payment transaction details"
  auth = false
  schema {
    int id {
      description = "Unique identifier for the transaction"
    }

    uuid ?order_id? {
      table = "orders"
      description = "Associated order ID"
    }

    text[] logs {
      description = "Array of logs or comments related to the transaction"
    }

    int customer_id {
      table = "user"
      description = "Customer ID related to the transaction"
    }

    decimal amount filters=min:0 {
      description = "Transaction amount"
    }

    text payment_method filters=trim {
      description = "Payment method used (e.g., credit card, PayPal)"
    }

    enum transaction_status {
      values = ["completed", "pending", "failed"]
      description = "Current status of the transaction (e.g., completed, pending)"
    }

    timestamp transaction_date?=now {
      description = "Date and time of the transaction"
    }

    json payment_gateway_metadata {
      description = "Metadata from the payment gateway"
      sensitive = true
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "order_id", op: "asc"}]}
  ]
}
```

## blog_post_table

```xs
table "blog_post" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the blog post"
    }

    text title filters=trim {
      description = "Title of the blog post"
    }

    text content filters=trim {
      description = "Main content/body of the blog post"
      sensitive = true
    }

    text[] tags {
      description = "Array of tags associated with the blog post"
    }

    int author_id {
      table = "user"
      description = "ID of the author who created the blog post"
    }

    timestamp ?publication_date?=now {
      description = "Date and time when the blog post was published"
    }

    json tags? {
      description = "Array of tags associated with the blog post for categorization"
    }

    bool is_draft?=1 {
      description = "Indicates whether the blog post is in draft status (not published)"
    }

    timestamp created_at?=now {
      description = "Timestamp when the blog post was created"
    }

    timestamp updated_at? {
      description = "Timestamp when the blog post was last updated"
    }

    text slug filters=trim {
      description = "URL-friendly version of the title for SEO purposes"
    }

    int view_count? {
      description = "Number of times the blog post has been viewed"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "author_id", op: "asc"}]}
    {
      type : "btree"
      field: [{name: "publication_date", op: "desc"}]
    }
    {type: "btree|unique", field: [{name: "slug", op: "asc"}]}
    {type: "btree", field: [{name: "is_draft", op: "asc"}]}
  ]
}
```

## table_for_user_profile

```xs
table "user_profile" {
  description = "Table to store user profiles for a social networking platform"
  auth = false
  schema {
    int id {
      description = "Unique user ID"
    }

    text full_name filters=trim {
      description = "User's full name"
    }

    email email filters=trim|lower {
      description = "User's email address"
      sensitive = true
    }

    text profile_picture_url filters=trim {
      description = "URL of the user's profile picture"
    }

    timestamp registration_date?=now {
      description = "Date and time the user registered"
    }

    bool is_active?=1 {
      description = "Indicates if the user is active"
    }

    int user? {
      table = "user"
      description = "A reference to the associated user account."
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "email", op: "asc"}]}
    {
      type : "btree"
      field: [{name: "registration_date", op: "desc"}]
    }
    {type: "btree|unique", field: [{name: "user", op: "asc"}]}
  ]
}
```

## product_reviews

```xs
table "product_reviews" {
  auth = false
  schema {
    int id {
      description = "Unique identifier for the review"
    }

    int rating filters=min:1|max:5 {
      description = "Rating given by the customer (1 to 5)"
    }

    text review_text filters=trim {
      description = "Text of the review provided by the customer"
      sensitive = true
    }

    timestamp review_date?=now {
      description = "Date and time when the review was submitted"
    }

    bool is_verified? {
      description = "Indicates whether the review is verified"
    }

    json metadata {
      description = "Additional metadata for the review (e.g., tags)"
    }

    int product_id {
      table = "product"
    }

    int customer_id {
      table = "customer"
      description = "Author of the review"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "product_id", op: "asc"}]}
    {type: "btree", field: [{name: "customer_id", op: "asc"}]}
  ]
}
```

## user_analytics_endpoint

```xs
table "user_activity" {
  auth = false
  schema {
    int id
    int user_id
    text action_type
    text action_details?
    text session_id
    timestamp session_start_time?
    timestamp session_end_time?
    int session_duration?
    text page_url?
    text referrer_url?
    text user_agent?
    text ip_address?
    text device_type?
    text browser?
    text country?
    text region?
    text city?
    timestamp created_at?=now
    timestamp updated_at?=now
    int page_load_time?
    json metadata?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id", op: "asc"}]}
    {type: "btree", field: [{name: "session_id", op: "asc"}]}
    {type: "btree", field: [{name: "action_type", op: "asc"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {
      type : "btree"
      field: [
        {name: "user_id", op: "asc"}
        {name: "created_at", op: "desc"}
      ]
    }
  ]
}
```

## survey_form_builder_system

```xs
table "surveys" {
  auth = false
  schema {
    int id {
      description = "Unique identifier for the survey"
    }

    text title filters=trim {
      description = "Survey title displayed to respondents"
    }

    text description? {
      description = "Optional survey description or instructions"
    }

    enum status? {
      values = ["draft", "active", "closed", "archived"]
      description = "Survey status - draft, active, closed, or archived"
    }

    json settings? {
      description = "Survey settings like anonymous responses, deadline, etc."
    }

    timestamp created_at?=now {
      description = "When the survey was created"
    }

    timestamp updated_at?=now {
      description = "When the survey was last updated"
    }

    int created_by? {
      description = "ID of user who created the survey"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "status", op: "asc"}]}
    {type: "btree", field: [{name: "created_by", op: "asc"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
```

## product_table

```xs
table "product" {
  auth = false
  schema {
    int id {
      description = "Unique product ID"
    }

    text name filters=trim {
      description = "Product name"
    }

    text description filters=trim {
      description = "Detailed product description"
    }

    decimal price? filters=min:0 {
      description = "Product price (non-negative)"
    }

    int stock_quantity? filters=min:0 {
      description = "Available stock quantity (non-negative)"
    }

    int category_id filters=min:0 {
      description = "Category ID for product classification"
    }

    text sku filters=trim {
      description = "Stock-keeping unit (unique identifier)"
      sensitive = true
    }

    timestamp created_at?=now {
      description = "Timestamp of product creation"
    }

    int in_cart?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "category_id", op: "asc"}]}
    {type: "btree|unique", field: [{name: "sku", op: "asc"}]}
  ]
}
```
