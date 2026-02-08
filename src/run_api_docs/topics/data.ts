import type { TopicDoc } from "../../meta_api_docs/types.js";

export const dataDoc: TopicDoc = {
  topic: "data",
  title: "Session Data Export",
  description: `The sink endpoint provides complete data export from session backups. This is the "kitchen sink" - everything from a session's database state in a single JSON response.

## Prerequisites
- Session must have been hibernated at least once (backup must exist)
- Hibernation creates a complete snapshot of all tables and data

## Use Cases
- Export complete session state for analysis
- Backup data before session termination
- Transfer data between sessions
- Debugging and auditing

## Data Included
- All table schemas
- All table data/records
- Complete as single JSON object`,

  ai_hints: `- Session must be hibernated before sink is available
- Hibernation happens automatically after project timeout or manually
- Large datasets may take time to export - be patient
- Use for complete data snapshots, not real-time queries
- Data is read-only - cannot modify via sink endpoint
- Public sessions can export without authentication`,

  endpoints: [
    {
      method: "GET",
      path: "/session/{session_id}/sink",
      tool_name: "getSessionSink",
      description: "Get full backup data from a session as JSON. Returns the complete 'kitchen sink' - all table schemas and data in one response. Session must have been hibernated at least once.",
      parameters: [
        { name: "session_id", type: "uuid", required: true, in: "path", description: "Session UUID" }
      ],
      example: {
        method: "GET",
        path: "/session/session-uuid-here/sink"
      }
    }
  ],

  schemas: {
    SinkResponse: {
      type: "object",
      properties: {
        tables: {
          type: "object",
          description: "Map of table names to their data",
          additionalProperties: {
            type: "object",
            properties: {
              schema: { type: "array", description: "Field definitions" },
              records: { type: "array", description: "All records in the table" }
            }
          }
        },
        metadata: {
          type: "object",
          properties: {
            session_id: { type: "uuid", description: "Source session" },
            exported_at: { type: "timestamp", description: "Export timestamp" },
            size: { type: "integer", description: "Backup size in bytes" }
          }
        }
      }
    }
  },

  examples: [
    {
      title: "Export session data",
      description: "Get all data from a hibernated session",
      request: {
        method: "GET",
        path: "/session/abc123-session-uuid/sink",
        headers: { "Authorization": "Bearer <token>" }
      },
      response: {
        tables: {
          users: {
            schema: [
              { name: "id", type: "int" },
              { name: "email", type: "text" },
              { name: "name", type: "text" }
            ],
            records: [
              { id: 1, email: "alice@example.com", name: "Alice" },
              { id: 2, email: "bob@example.com", name: "Bob" }
            ]
          },
          orders: {
            schema: [
              { name: "id", type: "int" },
              { name: "user_id", type: "int" },
              { name: "total", type: "decimal" }
            ],
            records: [
              { id: 1, user_id: 1, total: 99.99 }
            ]
          }
        }
      }
    }
  ],

  related_topics: ["session", "workflows"]
};
