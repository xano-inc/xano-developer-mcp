import type { TopicDoc } from "../types.js";

export const tableDoc: TopicDoc = {
  topic: "table",
  title: "Database Table Management",
  description: `Tables are the database layer in Xano. Each table has a schema (fields), indexes, and optional triggers.

## Key Concepts
- Tables store structured data with typed fields
- Schemas define field types, validation, and defaults
- Indexes improve query performance
- Triggers run automatically on data changes
- Tables can reference other tables (foreign keys)

## Field Types
- **Primitives:** int, text, bool, decimal, email, password
- **Temporal:** timestamp, date
- **Structured:** json, object
- **Files:** blob (with subtypes: image, video, audio, attachment)
- **References:** tableref, tablerefuuid (foreign keys)
- **Special:** enum, vector, geo_* (point, polygon, etc.)`,

  ai_hints: `- Always check existing schema before adding fields
- Use \`tableref\` type for foreign keys to other tables
- Consider indexes for frequently queried fields
- Triggers run automatically - be careful with side effects
- Use \`include_xanoscript=true\` to see full table definition`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/table",
      tool_name: "listTables",
      description: "List all database tables in a workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by table name" },
        { name: "sort", type: "string", enum: ["id", "name", "created_at"], default: "created_at", description: "Sort field" },
        { name: "order", type: "string", enum: ["asc", "desc"], default: "desc", description: "Sort direction" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript schema definition" },
        { name: "branch", type: "string", description: "Filter by branch name" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/table/{table_id}",
      tool_name: "getTable",
      description: "Get details of a specific table including schema.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "table_id", type: "integer", required: true, in: "path", description: "Table ID" },
        { name: "include_xanoscript", type: "boolean", default: false, description: "Include XanoScript definition" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/table",
      tool_name: "createTable",
      description: "Create a new database table with optional schema.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Table name", required: true },
          description: { type: "string", description: "Table description" },
          xanoscript: { type: "string", description: "XanoScript table definition with schema" }
        }
      },
      example: {
        method: "POST",
        path: "/workspace/1/table",
        body: {
          name: "users",
          xanoscript: `table users {
  id int [pk, auto]
  email text [unique]
  name text
  created_at timestamp [default:now]
}`
        }
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/table/{table_id}",
      tool_name: "updateTable",
      description: "Update table definition and schema.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "table_id", type: "integer", required: true, in: "path", description: "Table ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Table name" },
          description: { type: "string", description: "Table description" },
          xanoscript: { type: "string", description: "Updated XanoScript definition" }
        }
      }
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/table/{table_id}",
      tool_name: "deleteTable",
      description: "Delete a table and all its data. This action is irreversible.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "table_id", type: "integer", required: true, in: "path", description: "Table ID" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/table/{table_id}/schema",
      tool_name: "addTableField",
      description: "Add a new field to the table schema.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "table_id", type: "integer", required: true, in: "path", description: "Table ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Field name", required: true },
          type: { type: "string", description: "Field type (int, text, bool, etc.)", required: true },
          nullable: { type: "boolean", description: "Allow null values" },
          default: { type: "any", description: "Default value" }
        }
      }
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/table/{table_id}/index",
      tool_name: "createTableIndex",
      description: "Create an index on table fields for query performance.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "table_id", type: "integer", required: true, in: "path", description: "Table ID" }
      ],
      request_body: {
        type: "application/json",
        properties: {
          name: { type: "string", description: "Index name", required: true },
          type: { type: "string", description: "Index type: primary, unique, btree, search, spatial, vector", required: true },
          fields: { type: "array", description: "Fields to index", required: true }
        }
      }
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/table/{table_id}/content",
      tool_name: "getTableContent",
      description: "Get table content/data (paginated).",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "table_id", type: "integer", required: true, in: "path", description: "Table ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" }
      ]
    }
  ],

  schemas: {
    Table: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        description: { type: "string" },
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
              nullable: { type: "boolean" },
              default: { type: "any" }
            }
          }
        },
        indexes: { type: "array" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" }
      }
    },
    FieldTypes: {
      primitives: ["int", "text", "bool", "decimal", "email", "password"],
      temporal: ["timestamp", "date"],
      structured: ["json", "object"],
      files: ["blob", "image", "video", "audio", "attachment"],
      references: ["tableref", "tablerefuuid"],
      special: ["enum", "vector", "geo_point", "geo_polygon", "geo_linestring"]
    }
  },

  related_topics: ["function", "api", "workflows"]
};
