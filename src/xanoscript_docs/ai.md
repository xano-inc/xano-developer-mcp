---
applyTo: "function/**/*.xs, api/**/*.xs, task/*.xs, ai/tool/*.xs"
---

# AI Statements (Xano AI)

One-shot model calls inside any function stack: generate text, images, video, speech and music, transcribe audio, create embeddings and rerank documents.

> **TL;DR:** `ai.text.generate`, `ai.image.generate`, `ai.video.generate`, `ai.speech.generate`, `ai.speech.transcribe`, `ai.embedding.create`, `ai.rerank` and `ai.music.generate`. Each takes a `model` (a catalog model name), its inputs, and ends with `as $var`. They bill **Xano AI credits only**: there is no provider, `api_key` or BYO-model field. Media comes back as a **file resource**, which is not stored until you store it (for example with `storage.create_image`).

## Choosing a Statement

```
Need a model to...
├── One-shot call (one request, one answer)? → ai.*.generate and friends
│   ├── Write or classify text, answer a question, return JSON? → ai.text.generate
│   ├── Create or edit an image? → ai.image.generate
│   ├── Create a short video clip? → ai.video.generate
│   ├── Read text aloud (text to speech)? → ai.speech.generate
│   ├── Turn audio into text (speech to text)? → ai.speech.transcribe
│   ├── Create instrumental music or a song? → ai.music.generate
│   ├── Turn text or media into vectors for search? → ai.embedding.create
│   └── Re-order search results by relevance to a query? → ai.rerank
└── Tools, multi-step reasoning, or a conversation loop? → ai.agent.run (see `agents`)
```

**Rule of thumb:** need a one-shot model call → `ai.*.generate`; need tools or multiple steps → `ai.agent.run`.

## Quick Reference

| Statement | Purpose | Required keys | Returns (`as $result`) |
|-----------|---------|---------------|------------------------|
| `ai.text.generate` | Text or JSON generation | `model`, `prompt` (or `messages`) | `{text, json, model, finish_reason, usage}` |
| `ai.image.generate` | Create or edit an image | `model`, `prompt` | `{image, text, model, usage}` |
| `ai.video.generate` | Create a video clip | `model`, `prompt` | `{video, model, duration}` |
| `ai.speech.generate` | Text to speech | `model`, `text` | `{audio, model, usage}` |
| `ai.speech.transcribe` | Speech to text | `model`, `audio` | `{text, model, usage}` |
| `ai.embedding.create` | Embedding vectors | `model`, `input` | `{embeddings, model, usage}` |
| `ai.rerank` | Rank documents against a query | `model`, `query`, `documents` | `{results, model}` |
| `ai.music.generate` | Music clip or song | `model`, `prompt` | `{audio, model}` |

Every statement also accepts `description`, `disabled` and `mock`, like any other statement. `usage` is `{input_tokens, output_tokens}` when the model reports tokens, else `{}`.

`image`, `video` and `audio` in a result are **file resources**: nothing is saved automatically. Pass one to `storage.create_image` / `storage.create_attachment` (see `file-uploads`) or to `storage.create_file_resource` consumers, or upload it to your own bucket (see `integrations/cloud-storage`).

Inputs that take media (`files`, `images`, `image`, `last_image`, `audio`, and file items in `input`) take a file resource: a `file?` input, the media output of another `ai.*` statement, or the result of `storage.create_file_resource`.

---

## Billing: Xano AI Credits Only

- These statements call Xano-hosted models through the Xano AI gateway and charge the workspace owner's **Xano AI credits**.
- There is **no** `api_key`, `provider` or custom-model field. Writing one is a validation error. To use your own key or provider, call it with `api.request` (see `integrations/external-apis`) or configure an agent with that provider (see `agents`).
- When credits run out, the statement fails with code **`credits_exhausted`** ("Xano AI credits are exhausted. The account owner can buy more credits on the billing page"). An account on hold fails with **`account_on_hold`**. Wrap the call in `try_catch` when the endpoint must still answer without AI.
- A model that is not in the statement's catalog is refused with an error that lists the allowed models. Per-model options are checked too (for example `image_size = "4K"` on `gemini-3.1-flash-lite-image` is refused).

```xs
function "summarize_or_skip" {
  input {
    text body
  }
  stack {
    var $summary {
      value = null
    }

    try_catch {
      try {
        ai.text.generate {
          model = "gemini-3.8-flash"
          prompt = "Summarize in two sentences:\n" ~ $input.body
        } as $result

        var.update $summary {
          value = $result.text
        }
      }
      catch {
        debug.log {
          value = "Xano AI unavailable (credits_exhausted or account_on_hold); returning no summary"
        }
      }
    }
  }
  response = $summary
}
```

---

## Models

`model` is plain text, so a new catalog model needs no syntax change. The **suggested** model is the default the builder picks; use it unless you have a reason not to. Tiers are guidance: `best` (highest quality), `balanced`, `fast` (cheapest, lowest latency).

| Statement | Model | Tier | Stage | Notes |
|-----------|-------|------|-------|-------|
| `ai.text.generate` | `gemini-3.8-flash` | balanced | GA | **Suggested** |
| | `gemini-4-argon` | best | GA | |
| | `gemini-3.5-flash-lite` | fast | GA | |
| | `claude-fable-5-1` | best | GA | Anthropic on Vertex |
| | `claude-opus-5-5` | best | GA | Anthropic on Vertex |
| | `claude-sonnet-5-5` | balanced | GA | Anthropic on Vertex |
| | `claude-haiku-5-5` | fast | GA | Anthropic on Vertex |
| `ai.image.generate` | `gemini-3.1-flash-image` | balanced | GA | **Suggested** (Nano Banana 2); sizes 1K/2K/4K |
| | `gemini-3-pro-image` | best | GA | Nano Banana Pro; sizes 1K/2K/4K |
| | `gemini-3.1-flash-lite-image` | fast | GA | size 1K only |
| `ai.video.generate` | `veo-3.1-fast-generate-001` | balanced | GA | **Suggested**; 720p, 1080p, 4k |
| | `veo-3.1-generate-001` | best | GA | 720p, 1080p, 4k |
| | `veo-3.1-lite-generate-001` | fast | Preview | 720p, 1080p |
| `ai.speech.generate` | `gemini-3.8-flash-tts` | balanced | GA | **Suggested** |
| | `gemini-3.8-flash-lite-tts` | fast | GA | |
| `ai.speech.transcribe` | `gemini-3.5-transcribe` | default | GA | **Suggested** |
| `ai.embedding.create` | `gemini-embedding-2` | default | GA | **Suggested**; text, image, audio, video |
| | `gemini-embedding-001` | text only | GA | text only |
| `ai.rerank` | `semantic-ranker-default-005` | default | GA | **Suggested** |
| `ai.music.generate` | `lyria-002` | default | GA | **Suggested**; 32.8 s instrumental WAV |
| | `lyria-3-pro-preview` | best | Preview | up to 184 s, vocals, MP3 |

---

## ai.text.generate

Generate text, or JSON that matches a schema, from a prompt, prior messages and optional files.

| Key | Default | Notes |
|-----|---------|-------|
| `model` | `"gemini-3.8-flash"` | a text model from the table |
| `prompt` | — | text; required unless `messages` is set |
| `system` | `""` | system instructions |
| `messages` | `[]` | prior turns: `[{role: "user" \| "assistant", content: "..."}]` |
| `files` | `[]` | file resources sent with the prompt: image, PDF, audio and video on Gemini models; image and PDF on Claude |
| `temperature` | `null` | decimal `0`..`2`; `null` uses the model default |
| `max_tokens` | `null` | int; `null` uses the model default |
| `response_format` | `"text"` | `"text"` or `"json"` |
| `json_schema` | `null` | a JSON Schema object; use with `response_format = "json"` |

**Output:** `{text, json, model, finish_reason, usage}`. `json` is the parsed object when `response_format` is `"json"`, else `null`.

```xs
function "extract_invoice_fields" {
  input {
    file? invoice
  }
  stack {
    ai.text.generate {
      model = "gemini-3.8-flash"
      system = "You extract structured data from invoices. Use null for missing values."
      prompt = "Extract the vendor, invoice number, total and due date."
      files = [$input.invoice]
      temperature = 0
      response_format = "json"
      json_schema = {
        type: "object"
        properties: {
          vendor: {type: "string"}
          invoice_number: {type: "string"}
          total: {type: "number"}
          due_date: {type: "string", format: "date"}
        }
        required: ["vendor", "total"]
      }
    } as $result
  }
  response = $result.json
}
```

Continue a conversation with `messages` (the new `prompt` is the latest user turn):

```xs
function "chat_reply" {
  input {
    json history
    text question
  }
  stack {
    ai.text.generate {
      model = "claude-haiku-5-5"
      system = "You are a concise support assistant for Acme."
      messages = $input.history
      prompt = $input.question
      max_tokens = 400
    } as $reply
  }
  response = $reply.text
}
```

---

## ai.image.generate

Create an image from a prompt, or edit one: passing any image in `images` makes it an edit.

| Key | Default | Notes |
|-----|---------|-------|
| `model` | `"gemini-3.1-flash-image"` | an image model from the table |
| `prompt` | — | required |
| `images` | `[]` | file resources; any image makes this an edit |
| `aspect_ratio` | `"1:1"` | `1:1` `2:3` `3:2` `3:4` `4:3` `4:5` `5:4` `9:16` `16:9` `21:9` |
| `image_size` | `"1K"` | `1K`, `2K` or `4K`, as the model allows |

**Output:** `{image, text, model, usage}`. `image` is a file resource; `text` is any text the model returned, else `""`.

Generate an image, then store it:

```xs
function "create_product_hero" {
  input {
    text product_name
  }
  stack {
    ai.image.generate {
      model = "gemini-3.1-flash-image"
      prompt = "Studio product photo of " ~ $input.product_name ~ " on a white background, soft shadows"
      aspect_ratio = "16:9"
      image_size = "2K"
    } as $generated

    storage.create_image {
      value = $generated.image
      access = "public"
      filename = "hero.png"
    } as $stored

    db.add "product_image" {
      data = {
        product_name: $input.product_name
        image: $stored
      }
    } as $row
  }
  response = $row
}
```

Edit an uploaded image:

```xs
function "remove_background" {
  input {
    file? photo
  }
  stack {
    ai.image.generate {
      model = "gemini-3-pro-image"
      prompt = "Remove the background and replace it with plain white. Keep the subject unchanged."
      images = [$input.photo]
    } as $edited

    storage.create_image {
      value = $edited.image
      access = "private"
      filename = "edited.png"
    } as $stored
  }
  response = $stored
}
```

---

## ai.video.generate

Create a short video clip, optionally from a first and last frame. The statement waits for the result up to `timeout`.

| Key | Default | Notes |
|-----|---------|-------|
| `model` | `"veo-3.1-fast-generate-001"` | a video model from the table |
| `prompt` | — | required |
| `negative_prompt` | `""` | what to avoid |
| `image` | `null` | file resource; the first frame |
| `last_image` | `null` | file resource; the last frame |
| `aspect_ratio` | `"16:9"` | `16:9` or `9:16` |
| `resolution` | `"720p"` | `720p`, `1080p`, or `4k` (not on `veo-3.1-lite-generate-001`) |
| `duration` | `8` | `4`, `6` or `8` seconds |
| `generate_audio` | `true` | generate a soundtrack |
| `timeout` | `300` | seconds to wait for the result |

**Output:** `{video, model, duration}`. `video` is a file resource.

```xs
function "animate_listing_photo" {
  input {
    file? photo
  }
  stack {
    ai.video.generate {
      model = "veo-3.1-fast-generate-001"
      prompt = "Slow cinematic push-in on the living room, warm afternoon light"
      negative_prompt = "people, text, watermarks"
      image = $input.photo
      aspect_ratio = "9:16"
      resolution = "1080p"
      duration = 6
      generate_audio = false
      timeout = 600
    } as $clip

    storage.create_attachment {
      value = $clip.video
      access = "public"
      filename = "listing.mp4"
    } as $stored
  }
  response = $stored
}
```

---

## ai.speech.generate

Read text aloud (text to speech).

| Key | Default | Notes |
|-----|---------|-------|
| `model` | `"gemini-3.8-flash-tts"` | a TTS model from the table |
| `text` | — | required; the words to speak |
| `voice` | `"Kore"` | a Gemini prebuilt voice name |
| `instructions` | `""` | a style prompt, e.g. `"say cheerfully"` |

**Output:** `{audio, model, usage}`. `audio` is a file resource (`audio/wav`).

```xs
function "narrate_article" {
  input {
    text body
  }
  stack {
    ai.speech.generate {
      model = "gemini-3.8-flash-tts"
      text = $input.body
      voice = "Puck"
      instructions = "Read calmly, like a radio host"
    } as $speech

    storage.create_attachment {
      value = $speech.audio
      access = "public"
      filename = "narration.wav"
    } as $stored
  }
  response = $stored
}
```

---

## ai.speech.transcribe

Turn audio into text (speech to text).

| Key | Default | Notes |
|-----|---------|-------|
| `model` | `"gemini-3.5-transcribe"` | |
| `audio` | — | required; a file resource |
| `language` | `""` | BCP-47 hint, e.g. `"en-US"`; empty auto-detects |
| `prompt` | `""` | extra instructions or vocabulary (names, jargon) |

**Output:** `{text, model, usage}`.

```xs
function "transcribe_voice_note" {
  input {
    file? recording
  }
  stack {
    ai.speech.transcribe {
      model = "gemini-3.5-transcribe"
      audio = $input.recording
      language = "en-US"
      prompt = "Product names: Xano, XanoScript, Metadata API"
    } as $transcript

    db.add "voice_note" {
      data = {
        transcript: $transcript.text
      }
    } as $note
  }
  response = $note
}
```

---

## ai.embedding.create

Turn text or media into embedding vectors. One embedding per input, in input order.

| Key | Default | Notes |
|-----|---------|-------|
| `model` | `"gemini-embedding-2"` | `gemini-embedding-001` is text only |
| `input` | — | required; text, a file resource, or a list of either |
| `task_type` | `""` | `RETRIEVAL_QUERY`, `RETRIEVAL_DOCUMENT`, `SEMANTIC_SIMILARITY`, `CLASSIFICATION`, `CLUSTERING`, `QUESTION_ANSWERING`, `FACT_VERIFICATION` |
| `dimensions` | `null` | int output size; `null` uses the model default. Must match your `vector` column `size` |

**Output:** `{embeddings, model, usage}`. `embeddings` is `[[float, ...], ...]`, one per input.

Embed documents and store the vectors (the `document` table has a `vector? embedding? { size = 768 }` column with a vector index, see `tables`):

```xs
function "index_documents" {
  input {
    text[] contents
  }
  stack {
    ai.embedding.create {
      model = "gemini-embedding-2"
      input = $input.contents
      task_type = "RETRIEVAL_DOCUMENT"
      dimensions = 768
    } as $vectors

    // embeddings[i] belongs to contents[i]
    for ($input.contents|count) {
      each as $i {
        db.add "document" {
          data = {
            content: $input.contents|get:$i
            embedding: $vectors.embeddings|get:$i
          }
        } as $doc
      }
    }
  }
  response = $vectors.embeddings|count
}
```

Embed a query with `RETRIEVAL_QUERY` and search with `cosine_distance` (see `database`, Vector Search):

```xs
function "search_documents" {
  input {
    text query
  }
  stack {
    ai.embedding.create {
      model = "gemini-embedding-2"
      input = $input.query
      task_type = "RETRIEVAL_QUERY"
      dimensions = 768
    } as $q

    var $query_vector {
      value = $q.embeddings|get:0
    }

    db.query "document" {
      sort = {distance: "asc"}
      eval = {
        distance: $db.document.embedding|cosine_distance:$query_vector
      }
      return = {
        type: "list"
        paging: {page: 1, per_page: 20, metadata: false}
      }
    } as $candidates
  }
  response = $candidates
}
```

Use the same `model` and `dimensions` for documents and queries; vectors from different models are not comparable.

---

## ai.rerank

Re-order documents by relevance to a query. Typical use: take the top 20 to 50 vector-search hits and keep the best few.

| Key | Default | Notes |
|-----|---------|-------|
| `model` | `"semantic-ranker-default-005"` | |
| `query` | — | required |
| `documents` | — | required; a list of text, or of `{id?, title?, content}` objects |
| `top_n` | `null` | int; `null` returns every document |

**Output:** `{results, model}`. `results` is `[{index, id, score, content}]`, best first. `index` is the position in `documents`; `id` is the document's `id` (if given).

Rerank search results:

```xs
function "answer_sources" {
  input {
    text query
  }
  stack {
    function.run "search_documents" {
      input = {query: $input.query}
    } as $candidates

    ai.rerank {
      model = "semantic-ranker-default-005"
      query = $input.query
      documents = $candidates|map:{id: $$.id, content: $$.content}
      top_n = 5
    } as $ranked
  }
  response = $ranked.results
}
```

---

## ai.music.generate

Create a music clip (or, with `lyria-3-pro-preview`, a song with vocals).

| Key | Default | Notes |
|-----|---------|-------|
| `model` | `"lyria-002"` | `lyria-002`: 32.8 s instrumental WAV; `lyria-3-pro-preview`: up to 184 s, vocals, MP3 |
| `prompt` | — | required |
| `negative_prompt` | `""` | what to avoid |
| `seed` | `null` | int, for repeatable results |

**Output:** `{audio, model}`. `audio` is a file resource.

```xs
function "make_intro_jingle" {
  input {
  }
  stack {
    ai.music.generate {
      model = "lyria-002"
      prompt = "Upbeat lo-fi hip hop intro, mellow keys, light vinyl crackle"
      negative_prompt = "vocals, distortion"
      seed = 42
    } as $music

    storage.create_attachment {
      value = $music.audio
      access = "public"
      filename = "intro.wav"
    } as $stored
  }
  response = $stored
}
```

---

## Common Mistakes

1. **Adding an `api_key` or `provider`.** These statements bill Xano AI credits only; the keys do not exist. Use `api.request` or an agent provider for your own key.
2. **Expecting media to be saved.** `image`/`video`/`audio` are file resources. Store them with `storage.create_image` / `storage.create_attachment`, or they are gone after the request.
3. **Using `ai.agent.run` for a single call.** An agent is for tools and multi-step work. A single prompt-to-answer is `ai.text.generate`.
4. **Reading `$result.json` without `response_format = "json"`.** `json` is `null` for text responses.
5. **Mismatched embedding sizes.** `dimensions` must match the `vector` column `size`, and documents and queries must use the same model.
6. **A model from the wrong statement.** Each statement accepts only its own catalog models (an image model on `ai.text.generate` is refused).

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `agents` | `ai.agent.run`, for tools and multi-step work |
| `file-uploads` | `file?` inputs and storing files with `storage.create_image` / `storage.create_attachment` |
| `database` | Vector search with `cosine_distance` |
| `tables` | `vector` columns and vector indexes |
| `integrations/external-apis` | `api.request`, for calling a model with your own API key |
