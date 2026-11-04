---
applyTo: "function/**/*.xs, api/**/*.xs, task/*.xs, ai/tool/*.xs"
---

# AI Statements (Xano AI)

One-shot model calls inside any function stack: generate text, images, video, speech and music, transcribe audio, create embeddings and rerank documents.

> **TL;DR:** `ai.text.generate`, `ai.image.generate`, `ai.video.generate`, `ai.speech.generate`, `ai.speech.transcribe`, `ai.embedding.create`, `ai.rerank` and `ai.music.generate`. Each takes a `model` (a catalog model name), its inputs, and ends with `as $var`. They bill **Xano AI credits only**: there is no provider, `api_key` or BYO-model field. Media comes back as a **file resource**, which is not stored until you store it: set `save_to_files = "public"` (or `"private"`) and the media key (`image`/`video`/`audio`) holds the stored file instead, or pass the file resource to `storage.create_image` / `storage.create_video` / `storage.create_audio`.

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
| `ai.music.generate` | Music clip or song | `model`, `prompt` | `{audio, lyrics, description, model}` |

Every statement also accepts `description`, `disabled` and `mock`, like any other statement. `usage` is `{input_tokens, output_tokens}` when the model reports tokens, else `{}`.

`image`, `video` and `audio` in a result are **temporary file resources**: nothing is saved unless you ask. See **Storing Media** below.

Inputs that take media (`files`, `images`, `image`, `last_image`, `audio`, and file items in `input`) take a file resource: a `file?` input, the media output of another `ai.*` statement, or the result of `storage.create_file_resource`.

---

## Storing Media: `save_to_files` or a From File Statement

`ai.image.generate`, `ai.video.generate`, `ai.speech.generate` and `ai.music.generate` take an optional `save_to_files` key:

| `save_to_files` | Effect | The media key (`image`/`video`/`audio`) holds |
|-----------------|--------|-----------------------------------------------|
| `""` (default) | off: nothing is stored | the temporary file resource |
| `"public"` | saves the result to Files with public access | the stored file object (with `url`) |
| `"private"` | saves the result to Files with private access | the stored file object |

There is no separate key for the stored file: with `save_to_files` set, the media key itself is the stored file. The other keys (`model`, `usage`, ...) are unchanged.

`save_to_files` is a **shortcut**. It saves exactly as the matching From File statement does, and the media key holds exactly what that statement returns (same vault path, same file object, same URL):

| Statement | Same as adding |
|-----------|----------------|
| `ai.image.generate` | `storage.create_image` (Create Image From File) |
| `ai.video.generate` | `storage.create_video` (Create Video From File) |
| `ai.speech.generate` | `storage.create_audio` (Create Audio From File) |
| `ai.music.generate` | `storage.create_audio` (Create Audio From File) |

Put the stored file (the media key with `save_to_files` set, or the From File statement's result) into a file column, never the raw file resource: a file resource in a file column saves `null`.

Both ways, storing a generated image in a table:

```xs
function "store_fox_shortcut" {
  input {
  }
  stack {
    // 1. Shortcut: with save_to_files set, $fox.image is the stored file
    ai.image.generate {
      model = "gemini-3.1-flash-image"
      prompt = "A red fox, watercolor"
      save_to_files = "public"
    } as $fox

    db.add "gallery" {
      data = {
        image: $fox.image
      }
    } as $row
  }
  response = $row
}
```

```xs
function "store_fox_explicit" {
  input {
  }
  stack {
    // 2. Explicit: the From File statement (storage.create_image) on the file resource
    ai.image.generate {
      model = "gemini-3.1-flash-image"
      prompt = "A red fox, watercolor"
    } as $fox

    storage.create_image {
      value = $fox.image
      access = "public"
      filename = "fox.png"
    } as $stored

    db.add "gallery" {
      data = {
        image: $stored
      }
    } as $row
  }
  response = $row
}
```

Use the explicit statement when you need your own `filename`; the shortcut uses the statement's default name (for example `image.png` or `speech.wav`). To store in your own bucket instead, upload the file resource yourself (see `integrations/cloud-storage`).

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
| | `gemini-nano-banana-2.1` | balanced | GA | Nano Banana 2.1; sizes 1K/2K/4K |
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
| | `lyria-3-clip-preview` | fast | Preview | 30 s clip, MP3; returns `lyrics`/`description` |
| | `lyria-3-pro-preview` | best | Preview | full song up to 184 s, vocals, MP3; returns `lyrics`/`description` |

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
| `save_to_files` | `""` | `""` (off), `"public"` or `"private"`; shortcut for `storage.create_image` |

**Output:** `{image, text, model, usage}`. `image` is the stored file object when `save_to_files` is set, else a temporary file resource; `text` is any text the model returned, else `""`.

Generate an image and store it with the shortcut:

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
      save_to_files = "public"
    } as $generated

    db.add "product_image" {
      data = {
        product_name: $input.product_name
        image: $generated.image
      }
    } as $row
  }
  response = $row
}
```

Edit an uploaded image and store it with the explicit From File statement (`storage.create_image`), here to set the filename:

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
| `save_to_files` | `""` | `""` (off), `"public"` or `"private"`; shortcut for `storage.create_video` |

**Output:** `{video, model, duration}`. `video` is the stored file object when `save_to_files` is set, else a temporary file resource.

Store the clip with the shortcut:

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
      save_to_files = "public"
    } as $clip
  }
  response = $clip.video
}
```

The same with the explicit From File statement:

```xs
function "animate_listing_photo_explicit" {
  input {
    file? photo
  }
  stack {
    ai.video.generate {
      model = "veo-3.1-fast-generate-001"
      prompt = "Slow cinematic push-in on the living room, warm afternoon light"
      image = $input.photo
    } as $clip

    storage.create_video {
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
| `save_to_files` | `""` | `""` (off), `"public"` or `"private"`; shortcut for `storage.create_audio` |

**Output:** `{audio, model, usage}`. `audio` is the stored file object when `save_to_files` is set, else a temporary file resource (`audio/wav`).

Store the narration on a row with the shortcut:

```xs
function "narrate_article" {
  input {
    int article_id
    text body
  }
  stack {
    ai.speech.generate {
      model = "gemini-3.8-flash-tts"
      text = $input.body
      voice = "Puck"
      instructions = "Read calmly, like a radio host"
      save_to_files = "public"
    } as $speech

    db.edit "article" {
      field_name = "id"
      field_value = $input.article_id
      data = {
        narration: $speech.audio
      }
    } as $article
  }
  response = $article
}
```

The same with the explicit From File statement:

```xs
function "narrate_article_explicit" {
  input {
    int article_id
    text body
  }
  stack {
    ai.speech.generate {
      model = "gemini-3.8-flash-tts"
      text = $input.body
    } as $speech

    storage.create_audio {
      value = $speech.audio
      access = "public"
      filename = "narration.wav"
    } as $stored

    db.edit "article" {
      field_name = "id"
      field_value = $input.article_id
      data = {
        narration: $stored
      }
    } as $article
  }
  response = $article
}
```

Return the stored file from an API endpoint, with the model and usage alongside it:

```xs
query "speak" verb=POST {
  api_group = "ai"
  input {
    text text
  }
  stack {
    ai.speech.generate {
      model = "gemini-3.8-flash-tts"
      text = $input.text
      save_to_files = "public"
    } as $speech
  }
  response = $speech
}
```

```json
{
  "audio": {
    "access": "public",
    "path": "/vault/…/speech.wav",
    "name": "speech.wav",
    "type": "audio",
    "size": 214444,
    "mime": "audio/wav",
    "meta": {…},
    "url": "https://…/vault/…/speech.wav"
  },
  "model": "gemini-3.8-flash-tts",
  "usage": {"input_tokens": 13, "output_tokens": 107}
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

Create a music clip (or, with the Lyria 3 models, a clip or full song with vocals).

| Key | Default | Notes |
|-----|---------|-------|
| `model` | `"lyria-002"` | `lyria-002`: 32.8 s instrumental WAV; `lyria-3-clip-preview`: 30 s clip, MP3; `lyria-3-pro-preview`: full song up to 184 s, vocals, MP3 |
| `prompt` | — | required |
| `negative_prompt` | `""` | what to avoid; **`lyria-002` only** (refused on Lyria 3) |
| `seed` | `null` | int, for repeatable results; **`lyria-002` only** (refused on Lyria 3) |
| `save_to_files` | `""` | `""` (off), `"public"` or `"private"`; shortcut for `storage.create_audio` |

**Output:** `{audio, lyrics, description, model}`. `audio` is the stored file object when `save_to_files` is set, else a temporary file resource (WAV on `lyria-002`, MP3 on Lyria 3). `lyrics` and `description` are strings from the Lyria 3 models, or `null` when the model returns none (always `null` on `lyria-002`).

Store the jingle with the explicit From File statement (`storage.create_audio`):

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

    storage.create_audio {
      value = $music.audio
      access = "public"
      filename = "intro.wav"
    } as $stored
  }
  response = $stored
}
```

A song with Lyria 3, stored with the shortcut (no `negative_prompt` or `seed` here):

```xs
function "make_theme_song" {
  input {
  }
  stack {
    ai.music.generate {
      model = "lyria-3-pro-preview"
      prompt = "Cheerful indie pop song about shipping code on a Friday, female vocals"
      save_to_files = "public"
    } as $song

    db.add "song" {
      data = {
        audio: $song.audio
        lyrics: $song.lyrics
        description: $song.description
      }
    } as $row
  }
  response = $row
}
```

---

## Common Mistakes

1. **Adding an `api_key` or `provider`.** These statements bill Xano AI credits only; the keys do not exist. Use `api.request` or an agent provider for your own key.
2. **Expecting media to be saved.** `image`/`video`/`audio` are temporary file resources. Set `save_to_files`, or store them with `storage.create_image` / `storage.create_video` / `storage.create_audio`, or they are gone after the request.
3. **Using `ai.agent.run` for a single call.** An agent is for tools and multi-step work. A single prompt-to-answer is `ai.text.generate`.
4. **Reading `$result.json` without `response_format = "json"`.** `json` is `null` for text responses.
5. **Mismatched embedding sizes.** `dimensions` must match the `vector` column `size`, and documents and queries must use the same model.
6. **A model from the wrong statement.** Each statement accepts only its own catalog models (an image model on `ai.text.generate` is refused).
7. **Putting `$result.image` / `$result.audio` / `$result.video` straight into a file column.** That is a temporary file resource, and the column saves `null`. Set `save_to_files = "public"` (or `"private"`) on the statement (the key then holds the stored file), or use the result of the From File statement (`storage.create_image` / `storage.create_video` / `storage.create_audio`).

   ```xs
   // ❌ saves null (no save_to_files: $result.image is a file resource)
   db.add "gallery" {
     data = {image: $result.image}
   } as $row

   // ✅ save_to_files set: $result.image is the stored file
   ai.image.generate {
     model = "gemini-3.1-flash-image"
     prompt = "A red fox, watercolor"
     save_to_files = "public"
   } as $result

   db.add "gallery" {
     data = {image: $result.image}
   } as $row
   ```

8. **`negative_prompt` or `seed` on a Lyria 3 model.** They are `lyria-002` only; `lyria-3-clip-preview` and `lyria-3-pro-preview` refuse them with an error naming the model.
9. **`save_to_files` on `ai.text.generate`, `ai.speech.transcribe`, `ai.embedding.create` or `ai.rerank`.** Only the four media statements have it; elsewhere it is an unknown key.

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `agents` | `ai.agent.run`, for tools and multi-step work |
| `file-uploads` | `file?` inputs and storing files with `storage.create_image` / `storage.create_video` / `storage.create_audio` / `storage.create_attachment` |
| `database` | Vector search with `cosine_distance` |
| `tables` | `vector` columns and vector indexes |
| `integrations/external-apis` | `api.request`, for calling a model with your own API key |
