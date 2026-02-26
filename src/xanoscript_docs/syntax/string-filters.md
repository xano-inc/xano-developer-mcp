---
applyTo: ""
---

# String Filters & Encoding

Complete reference for XanoScript string filters, regex, encoding, and security filters.

> **These filters operate on STRING values only.** Do not use array filters (`count`, `reverse`, `first`, `last`, `slice`) on strings. Use `strlen` for string length, `substr` for substrings.

## Quick Reference

### String Filters

| Filter | Example | Result |
|--------|---------|--------|
| `trim` | `"  hi  "\|trim` | `"hi"` |
| `ltrim` / `rtrim` | `"  hi"\|ltrim` | `"hi"` |
| `to_lower` | `"Hi"\|to_lower` | `"hi"` |
| `to_upper` | `"Hi"\|to_upper` | `"HI"` |
| `capitalize` | `"hi there"\|capitalize` | `"Hi There"` |
| `strlen` | `"hello"\|strlen` | `5` |
| `substr` | `"hello"\|substr:1:3` | `"ell"` |
| `split` | `"a,b,c"\|split:","` | `["a","b","c"]` |
| `replace` | `"hello"\|replace:"l":"x"` | `"hexxo"` |
| `contains` | `"hello"\|contains:"ell"` | `true` |
| `starts_with` | `"hello"\|starts_with:"he"` | `true` |
| `ends_with` | `"hello"\|ends_with:"lo"` | `true` |
| `concat` | `"a"\|concat:"b":"-"` | `"a-b"` |

### Case-Insensitive Variants

`icontains`, `istarts_with`, `iends_with`, `iindex`

### Regex

```xs
"/pattern/"|regex_matches:"subject"           // Boolean match
"/(\w+)/"|regex_get_first_match:"test"        // First match
"/\w+/"|regex_get_all_matches:"a b c"         // All matches
"/\s+/"|regex_replace:"-":"a  b"              // Replace: "a-b"
```

## Text Functions

Statement-level functions for text manipulation within stacks. Functions that check a condition (e.g., `text.contains`, `text.starts_with`) store the result in an `as` variable. Functions that modify text (e.g., `text.trim`, `text.append`) mutate the variable directly.

### text.contains / text.icontains

```xs
text.contains $log_entry {
  value = "error"
} as $has_error

text.icontains $description {
  value = "error"
} as $has_error
```

### text.starts_with / text.istarts_with

```xs
text.starts_with $message {
  value = "Hello"
} as $starts_with_hello

text.istarts_with $title {
  value = "intro"
} as $starts_with_intro
```

### text.ends_with / text.iends_with

```xs
text.ends_with $url {
  value = ".com"
} as $is_com_domain

text.iends_with $filename {
  value = "pdf"
} as $ends_with_pdf
```

### text.trim / text.ltrim / text.rtrim

Removes characters (default is whitespace, or as specified by `value`). Mutates the variable directly.

```xs
text.trim $user_input { value = " " }
text.ltrim $user_input { value = " " }
text.rtrim $user_input { value = " " }
```

### text.append / text.prepend

Mutates the variable directly.

```xs
text.append $greeting { value = ", welcome!" }
text.prepend $message { value = "Alert: " }
```

### Text Domain Functions

Functional equivalents for string operations:

```xs
text.contains("hello world", "world")        // true
text.starts_with("hello", "he")              // true
text.ends_with("hello", "lo")                // true
text.icontains("Hello World", "WORLD")       // true (case-insensitive)
text.istarts_with("Hello", "HE")             // true
text.iends_with("Hello", "LO")               // true
```

## Encoding Filters

| Filter | Example |
|--------|---------|
| `json_encode` | `{a:1}\|json_encode` |
| `json_decode` | `'{"a":1}'\|json_decode` |
| `base64_encode` | `"hello"\|base64_encode` |
| `base64_decode` | `"aGVsbG8="\|base64_decode` |
| `url_encode` | `"a b"\|url_encode` |
| `url_decode` | `"a%20b"\|url_decode` |
| `xml_decode` | `"<a>1</a>"\|xml_decode` |
| `yaml_encode` / `yaml_decode` | YAML conversion |
| `hex2bin` / `bin2hex` | Hex conversion |

### Character Encoding

| Filter | Description | Example |
|--------|-------------|---------|
| `list_encodings` | List available encodings | `\|list_encodings` |
| `detect_encoding` | Detect string encoding | `$text\|detect_encoding` |
| `to_utf8` | Convert to UTF-8 | `$text\|to_utf8` |
| `from_utf8` | Convert from UTF-8 | `$text\|from_utf8:"ISO-8859-1"` |
| `convert_encoding` | Convert encodings | `$text\|convert_encoding:"UTF-8":"ISO-8859-1"` |

### CSV & Query String

```xs
$csv_text|csv_parse                          // Parse CSV string
$data|csv_create                             // Create CSV string
"a=1&b=2"|querystring_parse                  // {a: "1", b: "2"}
```

### String Escape Filters

| Filter | Description |
|--------|-------------|
| `addslashes` | Escape quotes and backslashes |
| `escape` | HTML escape |
| `text_escape` | Escape for text output |
| `text_unescape` | Unescape text |
| `regex_quote` | Escape regex special characters |

```xs
"Hello \"World\""|addslashes                 // "Hello \\\"World\\\""
"<script>"|escape                            // "&lt;script&gt;"
"^test$"|regex_quote                         // "\^test\$"
```

## Security Filters

> **Full reference:** See `xanoscript_docs({ topic: "security" })` for security best practices.

| Filter | Example |
|--------|---------|
| `md5` | `"text"\|md5` |
| `sha1` / `sha256` / `sha512` | Hash functions |
| `hmac_sha256` | `"msg"\|hmac_sha256:"key"` |
| `encrypt` | `"data"\|encrypt:"aes-256-cbc":"key":"iv"` |
| `decrypt` | `$enc\|decrypt:"aes-256-cbc":"key":"iv"` |
| `jws_encode` / `jws_decode` | JWT signing |
| `jwe_encode` / `jwe_decode` | JWT encryption |
| `secureid_encode` / `secureid_decode` | ID obfuscation |
| `uuid` | `\|uuid` |

---

## Related Topics

| Topic | Description |
|-------|-------------|
| `syntax` | Core operators, conditionals, type filters, error handling |
| `syntax/array-filters` | Array filters and array functions |
| `syntax/functions` | Math and object functions |
