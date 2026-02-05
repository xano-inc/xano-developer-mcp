---
applyTo: "**/*.xs"
---

# Tips and Tricks

## Variable definition

Xano doesn't have a concept of variable scope, you can define a variable anywhere in the stack and use it anywhere else.

```xs
var $greeting {
  value = "Hello, World!"
}
```

if defining an object or array, use `{}` or `[]`:

```xs
var $user {
  value = {
    name: "John Doe"
    email: "john.doe@example.com"
  }
}
```

```xs
var $numbers {
  value = [1, 2, 3, 4, 5]
}
```

## External API requests

When making an external API request, you'll want to use `params` for the request body, there is `body` keyword

## Comments

Use description argument on the statement or a comment `//` above it. Do not use description on responses, they do not support it. A comment can only be placed above a statement, not inside it.

````xs
// A simple hello world function
function "hello_world" {
  input {
    // The name of the person to greet
    text name
  }

  stack {
    // A simple greeting message
    var $greeting {
      value = "Hello, World!"
    }
  }

  response = $greeting
}

## Environment Variables

Always assume secrets and other configuration values are stored in the $env.<variable_name>, it's the responsibility of the user to create the values. Do not create a `.env` file. When adding a new environment variable, make sure to document it clearly and provide instructions for how to set it up.

## Conditionals

Conditionals accepts only one `if` and one `else` but you can add many `elseif` blocks.

## Existing logic and data schema

Try to reuse existing logic and data schema whenever possible. This includes using existing functions, API groups, data models, and API endpoints to avoid duplication and ensure consistency across your application.

## Large text

When dealing with large body of text (like a webpage, email body, AI prompt) it's best practice to use the `util.template_engine` function to manage and format the text efficiently. This templating system uses TWIG syntax.

```xs
    util.template_engine {
      description = "Create HTML table from event data"
      value = """
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Created At</th>
              <th>Type</th>
              <th>User ID</th>
              <th>Metadata</th>
              <th>Source</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {% for event in events %}
            <tr>
              <td>{{ event.id }}</td>
              <td>{{ event.created_at|format_timestamp("Y-m-d H:i:s", "UTC") }}</td>
              <td>{{ event.type }}</td>
              <td>{{ event.user_id ? event.user_id : "-" }}</td>
              <td>{{ event.metadata ? event.metadata : "-" }}</td>
              <td>{{ event.source ? event.source : "-" }}</td>
              <td>{{ event.ip_address ? event.ip_address : "-" }}</td>
            </tr>
            {% endfor %}
          </tbody>
        </table>
        """
    } as $html_table
````

## Filters

Xanoscript filters on inputs and values are inspired by TWIG, they use `|` to separate the variable from the filter. For example on an input block:

```xs
input {
  text filters=trim|lower {
    description = "Filters to apply to the text input"
  }
}
```

or a variable:

```xs
var $formatted_date {
  value = $event.created_at|format_timestamp("Y-m-d H:i:s", "UTC")
}
```

or a schema:

```xs
table "event" {
  schema {
    int id
    timestamp created_at?=now
    text type filters=trim|lower
    int user_id? filters=min:0
    text metadata? filters=trim
    text source? filters=trim|lower
    text ip_address? filters=trim
  }
}
```
