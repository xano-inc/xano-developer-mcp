import type { TopicDoc } from "../types.js";

export const fileDoc: TopicDoc = {
  topic: "file",
  title: "File Storage Management",
  description: `Files in Xano provide storage for images, videos, audio, and other attachments used by your application.

## Key Concepts
- Files are stored in Xano's managed storage
- Support for images, videos, audio, and general attachments
- Files can be public or private access
- Use in database blob fields or API responses
- Search and filter by name, type

## File Types
- **image**: PNG, JPG, GIF, WebP, etc.
- **video**: MP4, WebM, MOV, etc.
- **audio**: MP3, WAV, OGG, etc.
- **attachment**: PDF, DOC, ZIP, and other files`,

  ai_hints: `- Files must be uploaded via multipart/form-data
- Use public access for CDN-served static assets
- Use private access for sensitive documents
- Reference files in table blob fields by ID or path
- Large file uploads may need chunked upload strategy`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/file",
      tool_name: "listFiles",
      description: "List all files in a workspace with filtering.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "page", type: "integer", default: 1, description: "Page number" },
        { name: "per_page", type: "integer", default: 50, description: "Items per page" },
        { name: "search", type: "string", description: "Search by filename" },
        { name: "type", type: "string", enum: ["image", "video", "audio", "attachment"], description: "Filter by file type" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/file",
      tool_name: "uploadFile",
      description: "Upload a file to the workspace.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "multipart/form-data",
        properties: {
          file: { type: "file", description: "File to upload", required: true },
          access: { type: "string", description: "Access level: public or private" }
        }
      }
    }
  ],

  schemas: {
    File: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        path: { type: "string" },
        type: { type: "string", enum: ["image", "video", "audio", "attachment"] },
        size: { type: "integer", description: "File size in bytes" },
        access: { type: "string", enum: ["public", "private"] },
        url: { type: "string", description: "Public URL if accessible" },
        created_at: { type: "string", format: "date-time" }
      }
    }
  },

  related_topics: ["table", "api"]
};
