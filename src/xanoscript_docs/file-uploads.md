---
applyTo: "api/**/*.xs, function/**/*.xs"
---

# File Uploads (Native Xano Storage)

> **TL;DR:** To accept an uploaded file, declare the input as `file?` — **never** `image?`. Only `file` pre-processes the upload and populates `.path`; `image`/`attachment`/`video`/`audio` pass the raw upload object and every `storage.*` op then fails with `Missing param: path` (HTTP 400). Store with `storage.create_attachment` (accepts any file type), save the result to an `attachment?`/`image?` column, then return a viewable link: `storage.sign_private_url` for **private** files, or the instance URL + `.path` for **public** files.

This topic covers uploading files **to Xano's own private/public storage** (the vault). For pushing files to external buckets (AWS S3, Azure Blob, GCP Storage), see `integrations/cloud-storage` instead.

> **Comment syntax note:** XanoScript comments use `//` only (never `#`), and `//` is valid **only on its own line at the `input {}` / `stack {}` / top level — never inside an operation's `{ ... }` argument block and never as a trailing same-line comment**. Putting a comment inside `storage.create_attachment { ... }` or after `file? photo` is a parse error. Every example below follows this rule.

## Quick Reference

| Concern | Correct | Wrong |
|---------|---------|-------|
| Input type for an upload | `file? my_file` / `file[]? my_files` | `image?`, `attachment?`, `video?`, `audio?` |
| Storage op for any file type (PDF, HEIC, …) | `storage.create_attachment` | `storage.create_image` (image extensions only) |
| Storage op for images only (JPEG/PNG/GIF/WEBP) | `storage.create_image` | — |
| Reading the stored path | `$stored_file.path` | `$input.my_file.tmp_name`, `.path` (not real input properties) |
| Viewing a **private** file | `storage.sign_private_url` (pathname + ttl, one arg per line) | reading `.path` directly (returns HTTP 403) |
| Viewing a **public** file | instance base URL `~ $stored_file.path` (no signing) | `storage.sign_private_url` (works but is unnecessary) |
| Multiple-file form field | append as `field[]` (e.g. `photos[]`) | append repeatedly as `photos` (only the last file is kept) |
| Required `storage.*` args | always pass `value`, `access`, **and** `filename` | omitting `access` or `filename` (validation error) |
| Frontend `Content-Type` | let the browser set it | manually setting `multipart/form-data` |

## The Core Rule: `file?`, not `image?`

When the input is declared `image?` (or `video?`/`audio?`/`attachment?`), Xano hands your stack the raw upload object, which does **not** have a populated `.path`. Xano detects the missing `.path` at the **input-parsing layer**, before your stack even runs, so every upload fails:

```
Status 400 Bad Request
{ "code": "ERROR_CODE_INPUT_ERROR", "message": "Missing param: path",
  "payload": { "param": "my_file.path" } }
```

Because this fires before the stack runs, no in-stack workaround (e.g. copying `tmp_name` into `.path`) can rescue it — see Common Mistakes. When the input is declared `file?`, Xano pre-processes the multipart upload and sets `.path` **before the stack runs**. This is the single fix for `Missing param: path`.

> The input type names (`image`, `video`, `audio`, `attachment`, `file`) look like semantic choices but are technical: **only `file` populates `.path` on a multipart upload.** Use `file?` universally for uploads regardless of what kind of file you expect.

### Input type forms

```xs
// single file, optional
file? my_file
// single file, required
file my_file
// multiple files, optional array
file[]? my_files
// multiple files, required array
file[] my_files
```

## Storage Operations

All `storage.create_*` operations require three arguments — `value`, `access`, and `filename` — written one per line (block arguments are newline-separated; commas are only used inside object literals like `data = { ... }`).

### `storage.create_attachment` — any file type (recommended default)

```xs
storage.create_attachment {
  value    = $input.my_file
  access   = "private"
  filename = $input.my_file.name
} as $stored_file
```

Accepts images, PDFs, HEIC, and any other file type. Use this for documents, receipts, mixed uploads — anything where the file type is not guaranteed to be an image. Set `access` to `"private"` (default for sensitive data) or `"public"`.

### `storage.create_image` — images only

```xs
storage.create_image {
  value    = $input.my_file
  access   = "private"
  filename = $input.my_file.name
} as $stored_file
```

Validates the extension internally and **only accepts JPEG, PNG, GIF, WEBP**. A PDF or HEIC upload returns `Invalid file extension.` (HTTP 500, `code: ERROR_FATAL`). Only use when you are certain the upload will always be one of those image formats; otherwise prefer `storage.create_attachment`.

### The stored-file object

Both ops return an object with this shape (verified against a live workspace):

```
{
  "access": "private",                 // or "public" — the access you passed
  "path":   "/vault/Xq9lrwqH/.../doc.pdf",
  "name":   "doc.pdf",
  "type":   "image" | "pdf" | "video" | "audio" | ...,
  "size":   303,                       // bytes
  "mime":   "application/pdf",         // full MIME type
  "meta":   { "validated": false }     // images add "width" and "height"
}
```

`.path` is the permanent Xano vault path. Use it everywhere — in the DB record, in `sign_private_url`, and in responses. Save the **whole object** into an `attachment?`/`image?` column (not just the path) so the metadata is preserved.

### Viewing a private file — `storage.sign_private_url`

A `private` file is **not** directly reachable: requesting its `.path` without a signature returns HTTP 403. Generate a time-limited signed URL to display or download it:

```xs
storage.sign_private_url {
  pathname = $stored_file.path
  ttl      = 3600
} as $signed_url
```

`pathname` is the stored `.path` (use `$record.file.path` after reading the record back from the database). `ttl` is the lifetime in seconds, so `3600` = 1 hour; the URL stops working once it expires.

### Viewing a public file — no signing needed

A file stored with `access = "public"` is served **directly** at your instance's base URL followed by the stored `.path` (no signing, valid until the file is deleted). The stored object has **no** `url` field, so build the URL from `.path`:

```xs
storage.create_attachment {
  value    = $input.my_file
  access   = "public"
  filename = $input.my_file.name
} as $stored_file
```

Then return the path and let the client prepend its base URL, or build the absolute URL server-side (set `PUBLIC_BASE_URL` to your instance origin, e.g. `https://your-instance.xano.io`, in workspace env vars):

```xs
response = {
  path      : $stored_file.path
  public_url: ($env.PUBLIC_BASE_URL ~ $stored_file.path)
}
```

Use `public` only for non-sensitive assets (anyone with the URL can access it). Use `private` + `sign_private_url` for anything access-controlled.

### Serving a generated file (not an upload)

To serve a file you build in the stack (CSV/JSON/zip export, etc.), create it with `storage.create_file_resource`, then **store** it with `storage.create_attachment` to get a vault `.path`. The `create_file_resource` result is an internal file-resource token — it has **no** servable URL/path of its own.

```xs
storage.create_file_resource {
  filename = "export.csv"
  filedata = $csv_content
} as $resource
storage.create_attachment {
  value    = $resource
  access   = "public"
  filename = "export.csv"
} as $stored_file
```

Then serve `$stored_file` like any uploaded file: instance URL + `.path` for `public`, or `storage.sign_private_url` for `private`. See `integrations/utilities` for `create_file_resource` and zip/CSV details.

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

Declare the input `file[]?` and loop with `foreach`/`each as`. **The multipart field name must be sent with a `[]` suffix** (e.g. `photos[]`) for Xano to collect repeated parts into the array — see the frontend note below.

```xs
query upload_many verb=POST {
  api_group = "FileUploadDemo"
  input {
    text item_id
    file[]? photos?
  }
  stack {
    var $created { value = [] }
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
            } as $new_photo
            var.update $created {
              value = $created|push:{ id: $new_photo.id, path: $new_photo.file.path }
            }
          }
        }
      }
    }
  }
  response = {
    count  : $created|count
    created: $created
  }
}
```

## Table Schema for Stored Files

Store the file metadata object in an `attachment?` (or `image?`) column. Despite the names, both column types store the identical JSON structure (`access`, `path`, `name`, `type`, `size`, `mime`, `meta`), and both accept the result of `storage.create_attachment` **and** `storage.create_image` — there is no type mismatch at the data layer (verified live: an `image?` column accepts a `create_attachment` result and vice-versa).

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

## Deleting & Replacing Files

Delete a stored file from the vault by its `.path` (verified live — the signed URL returns 404 afterwards):

```xs
storage.delete_file { pathname = $stored_file.path }
```

To **replace** a file on a record: store the new upload, `db.edit`/`db.patch` the column with the new stored object, then `storage.delete_file` the old `.path`. Clearing the column (e.g. `db.patch` setting `file` to `null`) removes the reference but does not delete the vault file — call `delete_file` for that. (`storage.delete_file` lives in the `integrations/utilities` topic alongside `create_file_resource` and `read_file_resource`.)

## Frontend Pattern (JavaScript)

Always send files via `FormData`. **Never** set `Content-Type` manually — the browser sets `multipart/form-data` with the required boundary automatically.

```javascript
// Single file
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

// Multiple files — append with a `[]` suffix so a `file[]?` input receives ALL files.
// Appending repeatedly as 'photos' (no brackets) makes Xano keep only the LAST file.
async function uploadFiles(files, itemId) {
  const formData = new FormData();
  files.forEach(file => formData.append('photos[]', file));   // note the [] suffix
  formData.append('item_id', itemId);
  const response = await fetch(`${BASE_URL}/upload_many`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
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
- An endpoint's mode is determined by whether it currently has any file inputs. **Adding a file input to an existing JSON-only endpoint and pushing it via the CLI works** — the endpoint switches to multipart automatically on the next request (verified live; you do **not** need to create a separate endpoint).

## Common Mistakes

❌ **`image?` input — `Missing param: path` at runtime (validator does NOT catch this):**
```xs
input { image? photo }
stack {
  storage.create_image {
    value    = $input.photo
    access   = "private"
    filename = $input.photo.name
  } as $f
}
```
The snippet above is fully valid syntax — `xano_validate_xanoscript` passes it — but it fails at runtime because `image?` never populates `$input.photo.path`.

✅ **`file?` input populates `.path`:**
```xs
input { file? photo }
stack {
  storage.create_attachment {
    value    = $input.photo
    access   = "private"
    filename = $input.photo.name
  } as $f
}
```

❌ **Touching `.tmp_name` / hand-setting `.path` (hallucinated input properties — AI anti-pattern).** This does **not** help: with an `image?` input the `Missing param: path` error fires at the input layer before the stack runs, so the `|set` never executes (verified live).
```xs
input { image? photo }
stack {
  var $patched {
    value = $input.photo|set:"path":$input.photo.tmp_name
  }
  storage.create_attachment {
    value    = $patched
    access   = "private"
    filename = $patched.name
  } as $f
}
```

✅ **Just use `file?`** — Xano sets `.path` for you before the stack runs.

❌ **`storage.create_image` for a PDF — `Invalid file extension.` (HTTP 500):**
```xs
storage.create_image {
  value    = $input.document
  access   = "private"
  filename = $input.document.name
} as $f
```

✅ **`storage.create_attachment` accepts any type:**
```xs
storage.create_attachment {
  value    = $input.document
  access   = "private"
  filename = $input.document.name
} as $f
```

❌ **Omitting `access` or `filename`** — `storage.create_attachment { value = $input.photo } as $f` fails validation with `Missing required argument 'access'`. Always pass all three.

❌ **Comma-separated or commented op args** — `storage.create_attachment { value = ..., filename = ... }` and a comment inside the `{ }` are both parse errors. One argument per line, comments on their own line outside the block.

## Error Reference

| Error | Status | Cause | Fix |
|-------|--------|-------|-----|
| `Missing param: path` (`ERROR_CODE_INPUT_ERROR`, `payload.param` ends in `.path`) | 400 | Input declared `image?`/`video?`/`audio?`/`attachment?` — Xano doesn't set `.path` on the raw upload object | Change input type to `file?` |
| `Invalid file extension.` (`ERROR_FATAL`) | 500 | `storage.create_image` with a non-image (PDF, HEIC, …) | Use `storage.create_attachment` |
| `Missing required argument 'access'` (validation, at push time) | — | A `storage.create_*` call omitted `access` (or `filename`) | Pass `value`, `access`, and `filename` |
| HTTP 403 when fetching a file's `.path` | 403 | The file is `private`; raw paths aren't public | Generate `storage.sign_private_url`, or store the file as `public` |
| Multiple upload stored only one file | — | Multipart field appended without the `[]` suffix | Append files as `field[]` (e.g. `photos[]`) |

## Related Topics

| Topic | Use For |
|-------|---------|
| `integrations/utilities` | Other `storage.*` ops: `create_file_resource`, `read_file_resource`, `delete_file` |
| `integrations/cloud-storage` | Uploading to external buckets (AWS S3, Azure, GCP) instead of Xano's vault |
| `types` | Input block syntax and the full file-type list |
| `database` | `db.add` and storing the file metadata record |
| `streaming` | Streaming large files in requests/responses |
