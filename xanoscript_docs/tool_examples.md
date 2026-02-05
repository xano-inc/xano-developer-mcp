---
applyTo: "tools/**/*.xs"
---

# Xanoscript AI Tool Examples

Below are some examples of AI Tool configurations that can be made using Xanoscript.

## Tool with API, Task, and Tool Calls

This example demonstrates a tool that utilizes all three tool-specific statements: `api.call`, `task.call`, and `tool.call`.

```xs
tool "new_statements" {
  description = "A tool that demonstrates calling other Xano resources."

  instructions = "This tool is used to test the functionality of calling APIs, tasks, and other tools from within a tool. It takes a user's name as input and returns the result of an API call."

  input {
    text name? filters=trim {
      description = "The name of the user to be used in the various calls. Descriptions are important as they are sent to the AI."
    }
  }

  stack {
    api.call "auth/login" verb=POST {
      api_group = "Authentication"
      input = {email: "email@email.com", password: "password"}
    } as $endpoint1

    task.call "task_example" as $test1

    tool.call "what_is_xano" {
      input = {query: "What is Xano?"}
    } as $tool1
  }

  response = $endpoint1

  history = "inherit"
}
```

## Simple Information Retrieval Tool

This is an example of a simple tool that retrieves information.

```xs
tool "what_is_xano" {
  description = "Provides a brief description of Xano."
  instructions = "Use this tool to get a basic explanation of what Xano is."

  input {
    text query? {
      description = "A question about Xano. The content of the query is ignored, the tool always returns the same text."
    }
  }

  stack {
    var $xano_description {
      value = "Xano is a no-code backend platform that allows you to build scalable, secure, and compliant backends without writing any code."
    }
  }

  response = $xano_description

  history = 100
}
```
