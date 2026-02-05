# File & Static Hosting API

File management endpoints allow you to upload, list, and delete files in a workspace. Static hosting allows you to deploy static websites.

## File Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/file` | List files |
| POST | `/workspace/{workspace_id}/file` | Upload file |
| DELETE | `/workspace/{workspace_id}/file/{file_id}` | Delete file |
| DELETE | `/workspace/{workspace_id}/file/bulk_delete` | Bulk delete files |

## Static Host Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/{workspace_id}/static_host` | List static hosts |
| GET | `/workspace/{workspace_id}/static_host/{static_host}/build` | List builds |
| POST | `/workspace/{workspace_id}/static_host/{static_host}/build` | Create build |
| GET | `/workspace/{workspace_id}/static_host/{static_host}/build/{build_id}` | Get build |
| POST | `/workspace/{workspace_id}/static_host/{static_host}/build/{build_id}/env` | Deploy to environment |
| DELETE | `/workspace/{workspace_id}/static_host/{static_host}/build/{build_id}` | Delete build |

---

# Files

## List Files

```
GET /workspace/{workspace_id}/file
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 50 | Items per page (1-10000) |
| `search` | text | "" | Search by filename or MIME type |
| `access` | enum | "public" | Access level: "public", "private" |
| `sort` | enum | "created_at" | Sort: "created_at", "name", "size", "mime" |
| `order` | enum | "desc" | Sort order |

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | int | File unique identifier |
| `name` | text | Original filename |
| `size` | int | File size in bytes |
| `mime` | text | MIME type |
| `path` | text | Public URL path |
| `access` | enum | Access level |
| `created_at` | timestamp | Upload timestamp |

---

## Upload File

```
POST /workspace/{workspace_id}/file
```

**Content-Type:** `multipart/form-data`

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `content` | file | Yes | - | File to upload |
| `type` | enum | No | "" | Type hint: "image", "video", "audio" |
| `access` | enum | No | "public" | Access: "public", "private" |

**Notes:**
- Free tier users are restricted to image uploads only
- File size limits may apply based on plan

---

## Delete File

```
DELETE /workspace/{workspace_id}/file/{file_id}
```

**Warning:** Cannot be undone.

---

## Bulk Delete Files

```
DELETE /workspace/{workspace_id}/file/bulk_delete
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids[]` | int[] | Yes | Array of file IDs to delete |

**Warning:** Cannot be undone.

---

# Static Hosting

## List Static Hosts

```
GET /workspace/{workspace_id}/static_host
```

**Query Parameters:**
- `page` (int, default: 1): Page number

---

## List Builds

```
GET /workspace/{workspace_id}/static_host/{static_host}/build
```

**Path Parameters:**
- `static_host` (text): Static host name

**Query Parameters:**
- `page` (int, default: 1): Page number

---

## Create Build

```
POST /workspace/{workspace_id}/static_host/{static_host}/build
```

Upload a zip file to create a new build.

**Content-Type:** `multipart/form-data`

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `file` | file | Yes | - | Zip archive of static site |
| `name` | text | Yes | - | Build name/version |
| `description` | text | No | "" | Build description |

**Response:**
Returns created build object with dev environment URL.

**Notes:**
- New builds are automatically deployed to `dev` environment
- Upload a zip file containing your static site files
- If `static_host` is "default" and doesn't exist, it will be created

---

## Get Build

```
GET /workspace/{workspace_id}/static_host/{static_host}/build/{build_id}
```

---

## Deploy Build to Environment

```
POST /workspace/{workspace_id}/static_host/{static_host}/build/{build_id}/env
```

Deploy a build to a specific environment.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `env` | enum | Yes | Environment: "prod", "dev" |

**Response:**
Returns the environment URL for the deployed build.

---

## Delete Build

```
DELETE /workspace/{workspace_id}/static_host/{static_host}/build/{build_id}
```

**Warning:** Cannot be undone.
