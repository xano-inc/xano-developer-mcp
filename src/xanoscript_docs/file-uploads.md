---
applyTo: "api/**/*.xs, function/**/*.xs"
---

# File Uploads (Native Xano Storage)

> **TL;DR:** To accept an uploaded file, declare the input as `file?` — **never** `image?`. Only `file` pre-processes the upload and populates `.path`; `image`/`attachment`/`video`/`audio` pass the raw upload object and every `storage.*` op then fails with `Missing param: path`. Store with `storage.create_attachment` (accepts any file type), save the result to a `attachment?`/`image?` column, then generate a viewable link with `storage.sign_private_url`.

This topic covers uploading files **to Xano's own private/public storage** (the vault). For pushing files to external buckets (AWS S3, Azure Blob, GCP Storage), see `integrations/cloud-storage` instead.

## Quick Reference

| Concern | Correct | Wrong |
|---------|---------|-------|
| Input type for an upload | `file? my_file` / `file[]? my_files` | `image?`, `attachment?`, `video?`, `audio?` |
| Storage op for any file type (PDF, HEIC, …) | `storage.create_attachment` | `storage.create_image` (image extensions only) |
| Storage op for images only (JPEG/PNG/GIF/WEBP) | `storage.create_image` | — |
| Reading the stored path | `$stored_file.path` | `$input.my_file.tmp_name`, `.path` (not real input properties) |
| Frontend `Content-Type` | let the browser set it | manually setting `multipart/form-data` |
| Endpoint with file + JSON fields | one multipart endpoint, all fields as form fields | mixing a JSON body with a file part |

## The Core Rule: `file?`, not `image?`

When the input is declared `image?` (or `video?`/`audio?`/`attachment?`), Xano hands your stack the raw upload object — which has `name`, `size`, `type`, `tmp_name`, but **no `path`**. Every `storage.*` operation reads `value.path` internally, so it fails:

```
Status 400 Bad Request
{ "code": "ERROR_CODE_INPUT_ERROR", "message": "Missing param: path",
  "payload": { "param": "my_file.path" } }
```

When the input is declared `file?`, Xano pre-processes the multipart upload and sets `.path` **before the stack runs**. This is the single fix for `Missing param: path`.

> The input type names (`image`, `video`, `audio`, `attachment`, `file`) look like semantic choices but are technical: **only `file` populates `.path` on a multipart upload.** Use `file?` universally for uploads regardless of what kind of file you expect.

### Input type forms

```xs
file? my_file      // single file, optional
file my_file       // single file, required
file[]? my_files   // multiple files, optional array
file[] my_files    // multiple files, required array
```

## Storage Operations

### `storage.create_attachment` — any file type (recommended default)

```xs
storage.create_attachment {
  value    = $input.my_file
  access   = "private"            // or "public"
  filename = $input.my_file.name
} as $stored_file
```

Accepts images, PDFs, HEIC, and any other file type. Use this for documents, receipts, mixed uploads — anything where the file type is not guaranteed to be an image. The returned object has the same shape as `storage.create_image` (`path`, `name`, `type`, `size`), so everything downstream is identical.

### `storage.create_image` — images only

```xs
storage.create_image {
  value    = $input.my_file
  access   = "private"
  filename = $input.my_file.name
} as $stored_file
```

Validates the extension internally and **only accepts JPEG, PNG, GIF, WEBP**. A PDF or HEIC upload returns `Invalid file extension` (HTTP 500). Only use when you are certain the upload will always be one of those image formats; otherwise prefer `storage.create_attachment`.

### Signing a private URL

A `private` file has no public URL. Generate a time-limited signed URL to display or download it:

```xs
storage.sign_private_url {
  pathname = $stored_file.path   // or $record.file.path after a db read
  ttl      = 3600                // seconds (1 hour)
} as $signed_url
```

`.path` is the permanent Xano vault path (e.g. `/vault/Xq9lrwqH/...`). Use it everywhere — in the DB record, in `sign_private_url`, and in responses.

## Complete Single-Upload Pattern

This is the full, end-to-end flow validated against a live Xano workspace (`file?` input → `storage.create_attachment` → `db.add` → `storage.sign_private_url`):

```xs
query upload verb=POST {
  api_group = "FileUploadDemo"
  input {
    text? name? filters=trim
    // MUST be `file?` — only `file` populates `.path` on a multipart upload.
    file? document
  }
  stack {
    precondition ($input.document != null) {
      error_type = "inputerror"
      error = "Provide a file in the `document` field."
    }

    // create_attachment accepts any file type (PDF, HEIC, etc.).
    storage.create_attachment {
      value    = $input.document
      access   = "private"
      filename = $input.document.name
    } as $stored_file

    db.add upload_demo_file {
      data = {
        created_at: "now"
        name      : $input.name
        file      : $stored_file
      }
    } as $rec

    storage.sign_private_url {
      pathname = $rec.file.path
      ttl      = 3600
    } as $signed_url
  }
  response = {
    id        : $rec.id
    name      : $rec.name
    path      : $rec.file.path
    size      : $rec.file.size
    signed_url: $signed_url
  }
}
```

## Complete Multiple-Upload Pattern

```xs
input {
  text item_id
  file[]? photos?
}
stack {
  conditional {
    if ($input.photos != null && ($input.photos|count) > 0) {
      foreach ($input.photos) {
        each as $file {
          storage.create_attachment {
            value    = $file
            access   = "private"
            filename = $file.name
          } as $stored_file
          db.add item_photo {
            data = {
              item_id: $input.item_id
              file   : $stored_file
            }
          } as $_new_photo
        }
      }
    }
  }
}
```

## Table Schema for Stored Files

Store file metadata in an `attachment?` (or `image?`) column. Despite the names, both column types store the identical JSON structure (`path`, `name`, `type`, `size`), and both accept the result of `storage.create_attachment` **and** `storage.create_image` — there is no type mismatch at the data layer.

```xs
table upload_demo_file {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    text? name? filters=trim
    // File metadata from storage.create_attachment / storage.create_image.
    attachment? file?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
  ]
}
```

Use `attachment?` for general files and `image?` for image-only columns if you want the schema to be semantically accurate. Functionally, both work for either storage op.

## Frontend Pattern (JavaScript)

Always send files via `FormData`. **Never** set `Content-Type` manually — the browser sets `multipart/form-data` with the required boundary automatically.

```javascript
async function uploadFile(file, name) {
  const formData = new FormData();
  formData.append('document', file);   // field name must match the XanoScript input name
  formData.append('name', name);       // text fields go in the same FormData
  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },  // NO Content-Type header
    body: formData
  });
  if (!response.ok) throw new Error((await response.json()).message);
  return response.json();
}
```

```html
<!-- Any file (documents, images, PDFs) -->
<input type="file" id="document" accept="image/*,application/pdf">
<!-- Multiple -->
<input type="file" id="photos" accept="image/*" multiple>
```

## JSON Endpoints vs Multipart Endpoints

- An endpoint with **no** file inputs receives a JSON body (`Content-Type: application/json`).
- An endpoint with **any** file input must be sent as `FormData` (multipart). If you need both a file and text fields in one request, put everything in `FormData` — text fields become form fields, files become file parts. Do not mix a JSON body with a file part.

> **Field caveat:** when adding a file input to an *existing* JSON-only endpoint via CLI push, Xano may not switch the endpoint into multipart-handling mode. If an existing endpoint won't process the uploaded file, create a dedicated new endpoint that has the file input from the start.

## Common Mistakes

❌ **`image?` input — `Missing param: path` at runtime (validator does NOT catch this):**
```xs
input { image? photo }
stack {
  storage.create_image { value = $input.photo } as $f   // fails: photo has no .path
}
```

✅ **`file?` input populates `.path`:**
```xs
input { file? photo }
stack {
  storage.create_attachment { value = $input.photo, filename = $input.photo.name } as $f
}
```

❌ **Touching `.tmp_name` / hand-setting `.path` (hallucinated input properties — AI anti-pattern):**
```xs
// |set:"path":$input.photo.tmp_name  -- do NOT do this; band-aid for the wrong input type
```

✅ **Just use `file?`** — Xano sets `.path` for you before the stack runs.

❌ **`storage.create_image` for a PDF — `Invalid file extension` (HTTP 500):**
```xs
storage.create_image { value = $input.document }   // PDFs/HEIC rejected
```

✅ **`storage.create_attachment` accepts any type:**
```xs
storage.create_attachment { value = $input.document, filename = $input.document.name } as $f
```

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing param: path` (400) | Input declared `image?`/`video?`/`audio?`/`attachment?` — Xano doesn't set `.path` on the raw upload object | Change input type to `file?` |
| `Invalid file extension` (500) | `storage.create_image` with a non-image (PDF, HEIC, …) | Use `storage.create_attachment` |
| File field arrives empty / not processed | File input added to a pre-existing JSON-only endpoint | Create a dedicated endpoint with the file input from the start |

## Related Topics

| Topic | Use For |
|-------|---------|
| `integrations/utilities` | Other `storage.*` ops: `create_file_resource`, `read_file_resource`, `delete_file` |
| `integrations/cloud-storage` | Uploading to external buckets (AWS S3, Azure, GCP) instead of Xano's vault |
| `types` | Input block syntax and the full file-type list |
| `database` | `db.add` and storing the file metadata record |
| `streaming` | Streaming large files in requests/responses |
