# XanoScript Workspace

This document provides an overview of the XanoScript workspace structure and guidelines for organizing your XanoScript files within a VSCode environment. The workspace is designed to facilitate efficient development, version control, and collaboration.

## Environment Variables

Environment variables can be used in XanoScript by using the `$env` prefix. The user can set their own environment variables, Xano also provides some built-in environment variables. The following are some of the built-in environment variables:

- `$env.$remote_ip`:this is a special environment variable that resolves to the IP address of the individual accessing the API endpoint.
- `$env.$http_headers`:this is a text array of headers that are sent to the API endpoint.
- `$env.$request_uri`:this is a special environment variable that contains the URI that is being accessed from the API.
- `$env.$request_method`:this is the method (GET, POST, DELETE, etc) of the incoming API request.
- `$env.$request_querystring`:this is a special environment variable that contains the query string of the URI that is being accessed from the API.
- `$env.$datasource`:this is a special environment variable that contains which datasource is being used.
- `$env.$branch`:this is a special environment variable that contains which branch is being used.

Custom environment variables can be set in the Xano dashboard under Settings > Environment Variables. These variables can be accessed in XanoScript using the `$env` prefix followed by the variable name (e.g., `$env.MY_CUSTOM_VARIABLE`). When using custom environment variables ($env.SOME_SERVICE_API_KEY), You should inform the user to set them up in their Xano dashboard.
