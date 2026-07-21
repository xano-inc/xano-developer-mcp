---
applyTo: "**/*.xs"
---

# Xano Expressions

> **TL;DR:** Xano expressions are inline, single-expression data transformations (no statements, no loops, no variable declarations). One expression evaluates against a context of variables and returns one value. In XanoScript they appear inside backtick expression mode, value assignments, and expression-argument filters (`map`, `filter`, `reduce`, `transform`); the same engine powers the "expression" value type in the visual builder.

## Quick Reference

| Category   | Operator          | Meaning                 | Example → Result                  |
| ---------- | ----------------- | ----------------------- | --------------------------------- |
| Math       | `+` `-` `*` `/`   | arithmetic              | `1 + 2 * 3` → `7`                 |
| Grouping   | `( )`             | override precedence     | `(1 + 2) * 3` → `9`               |
| Text       | `~`               | string concatenation    | `$a ~ " " ~ $b` → `"Hello World"` |
| Array      | `...`             | spread/merge arrays     | `[...$array1, ...$array2]`        |
| Array      | `..`              | inclusive integer range | `1..10` → `[1,…,10]`              |
| Comparison | `==` `!=`         | loose (type-coercing)   | `5 == "5"` → `true`               |
| Comparison | `===` `!==`       | strict (type-sensitive) | `5 === "5"` → `false`             |
| Comparison | `>` `<` `>=` `<=` | ordering                | `$user.age > 21`                  |
| Logical    | `&&` `\|\|` `!`   | and / or / not          | `$a > 21 && $b == "USA"`          |
| Null       | `??`              | null-coalescing default | `$maybeNull ?? 0`                 |

Key syntax: `$name` variable refs (no scope prefix) · `[n]`/`.n` index, negative from end · auto-flattening paths (`$products.listing.price` → flat array) · `[condition]` array filter with `$$` as current element · `$0`/`$1`/… anchor outer path levels · `value|transformer:arg` pipes · `|set:path:value` copies-with-update · `path = expr` assignment form.

## Context & Variable References

The evaluation context provides four scopes: `$var` (function-stack variables), `$env` (environment), `$input` (request inputs), `$auth` (auth data). Inside an expression, reference a variable directly by name with a `$` prefix — you do NOT write the scope:

- Context `{ "$var": { "user": {...} } }` → reference as `$user`, not `$var.user`.

## Operators

See the Quick Reference table above. Rules:

- Evaluation is left-to-right; `*` and `/` bind tighter than `+` and `-`. Use parentheses when in doubt.
- Text concatenation is `~`, never `+`. Add spacing explicitly: `$a ~ " " ~ $b`.
- Prefer `===`/`!==` unless type coercion is intentional.

## Path Navigation

- Dot notation for object properties: `$user.location.city`.
- Numeric index for array elements: `$products.0.listing.1.price`. Bracket form `$letters[0]` also works; negative indexes count from the end (`$letters[-1]` → last element).
- **Auto-flattening:** navigating a property _through_ an array maps over it. `$products.listing.price` returns one flat array of every price across every product's listing.

## Filtering Arrays: `[condition]` and `$$`

A bracketed boolean expression after an array filters its elements. `$$` is the current element being tested:

```
$stores[$$.category == "retail"]            // stores whose category is retail
$products[$$.name === "pixel 8"].listing.price   // prices for one product
```

Filters chain with further navigation and can appear at any depth.

## Anchoring Variables: `$0`, `$1`, `$2`, …

Inside nested filters, `$n` references level _n_ of the current navigation path (root = `$0`, alternating array / element / array / element as you descend). For the path `$products.0.listing.0.price`:

- `$0` = `$products` (the array)
- `$1` = the current product (`$products.0`)
- `$2` = that product's `listing` array
- `$3` = the current listing element

Use `$$` for the innermost element (readability), `$n` to reach _outer_ levels from an inner filter:

```
// listings priced under their own product's MSRP
$products[$$.name === "pixel 8"].listing[$$.price < $1.msrp]

// cheapest listing: compare each price to the min over the anchored product's listing
$products[$$.name === "pixel 8"].listing[$$.price == ($1.listing.price|min)]

// cross-variable lookup: listings whose store (matched by id) is retail
$products.listing[($stores[$$.id === $3.store_id]).category == "retail"]
```

In the last example the inner filter runs on `$stores`, so `$$` is a store; `$3` anchors back to the current listing element of the outer path.

## Transformers (pipe `|`)

`value|transformer` or `value|transformer:arg1:arg2`. Chains apply left to right, each receiving the previous result — order matters (`"Epic Battle"|to_upper|split:" "` works; reversed it wouldn't, since `to_upper` expects a string).

Common transformers seen in these docs (the full catalog of 210 is in the Appendix — only use names from there):

| Transformer      | Purpose                                         | Example                                        |
| ---------------- | ----------------------------------------------- | ---------------------------------------------- |
| `to_upper`       | uppercase a string                              | `hello\|to_upper` → `"HELLO"`                  |
| `split:sep`      | string → array                                  | `"a b"\|split:" "` → `["a","b"]`               |
| `map:(expr)`     | apply expr to each element (`$$` = element)     | `"Epic Battle"\|split:" "\|map:($$\|to_upper)` |
| `min`            | minimum of numeric array                        | `$prices\|min`                                 |
| `first`          | first element (unwrap 1-element filter results) | `$stores[$$.id == $x]\|first`                  |
| `round:n`        | round to n decimals                             | `$p / 1.1 \| round:2`                          |
| `set:path:value` | see Updating Data below                         |                                                |

Parenthesize sub-expressions inside transformer args so the pipe applies to the right operand: `map:($$|to_upper)`.

## Updating Data: `set` and Assignment

**`|set:path:value`** returns a copy with `path` updated (or added). The path is relative to the piped value and auto-maps over arrays; inside `value`, anchoring variables refer to the piped value's path levels:

```
$stores.1|set:discount:0.16                       // update one field

$products                                          // add store discount to every listing
  |set:listing.discount:(($stores[$$.id == $3.store_id]|first).discount ?? 0)
  |set:listing.price:($3.price / (1 + $3.discount) | round:2)
```

- Chained `set`s see the result of the previous `set` (above, the second reads the `discount` written by the first).
- Guard lookups that can miss with `?? default` — an unmatched filter yields `null`.

**Conditional set** — put a filter in the set path; only matching elements are touched (others are left without the attribute):

```
$products|set:listing[$1.msrp > $$.price].is_discounted:true
```

**Assignment form** — `path = expr` is shorthand for a set over the full structure, with `$$` as the current element:

```
$products.listing.price = $$.price * 1.1    // returns $products with all prices +10%
```

## Keeping Expressions Simple

Expressions pack a lot of power into one line, and that power cuts both ways: a long chain of filters, nested `[condition]` blocks, and anchoring variables is hard to read, hard to debug (there is no way to inspect an intermediate value inside a single expression), and hard to modify safely. Prefer short, simple expressions.

When an expression grows, **decompose it into intermediate variables** — each step gets a name and can be inspected on its own:

```xs
// ❌ One dense expression — works, but opaque and undebuggable
var $cheapest {
  value = `$products[$$.name === "pixel 8"].listing[$$.price == ($1.listing.price|min)]|first`
}

// ✅ Decomposed — each step is named, inspectable, and independently testable
var $pixel     { value = `$products[$$.name === "pixel 8"]|first` }
var $min_price { value = `$pixel.listing.price|min` }
var $cheapest  { value = `$pixel.listing[$$.price == $min_price]|first` }
```

Decomposition also removes the need for anchoring variables in many cases (above, `$1.listing.price` becomes plain `$pixel.listing.price`), which is a readability win on its own.

Decomposition is not always possible — a single expression field in the visual builder, a filter argument, or a `set` value must stay one expression. In those cases:

- Build the expression incrementally and verify each stage's output before adding the next (the expression playground is ideal for this).
- Format long expressions across multiple lines (chained `|set:` calls especially).
- Reach for `$$` over `$n` anchors wherever both work — and if you find yourself three anchor levels deep, treat it as a signal to restructure.

## Common Mistakes

- Long chained expressions are hard to debug — keep expressions short, and decompose into intermediate variables when the context allows (see Keeping Expressions Simple).
- `+` on strings is wrong — use `~`: `$first ~ " " ~ $last`.
- `==` coerces types; use `===` for exactness.
- Filter results are always arrays, even for a single match — unwrap before accessing properties: `($stores[$$.id == $x]|first).category`.
- Lookups can miss → `null`; default with `??` before doing math: `($lookup.price ?? 0) * 1.1`.
- Transformer chain order matters; each stage must receive the type the next transformer expects.
- Prefer `$$` for the current element; reserve `$1`/`$3` etc. for reaching outer path levels, and derive the number by writing out the explicit path (`$products.0.listing.0.…`) and counting levels from `$0`.

## Appendix: Filter Catalog

All 210 available filters, grouped by category. Where two names are shown, the first is the display/documented name and the parenthesized one is a canonical alias. Signatures, argument lists, and worked examples for every filter live in `xano_xanoscript_docs({ topic: "expressions/filters" })` — look a filter up there before using arguments.

- **math:** `deg2rad`, `rad2deg`, `number_format`, `sin`, `asin`, `asinh`, `cos`, `acos`, `acosh`, `tan`, `atan`, `atanh`, `floor`, `ceil`, `round`, `abs`, `sqrt`, `exp`, `log`, `log10`, `ln`, `pow`, `array_min (min)`, `array_max (max)`, `min (num_min)`, `max (num_max)`, `sum`, `avg`, `product`, `add`, `subtract (sub)`, `multiply (mul)`, `modulus (mod)`, `divide (div)`, `bitwise_and`, `bitwise_or`, `bitwise_xor`
- **array:** `first`, `last`, `count`, `range`, `reverse`, `unique`, `safe_array`, `flatten`, `filter_empty`, `sort (fsort)`, `shuffle (array_shuffle)`, `diff (array_diff)`, `diff_assoc (array_diff_assoc)`, `intersect (array_intersect)`, `intersect_assoc (array_intersect_assoc)`, `merge (array_merge)`, `merge_recursive (array_merge_recursive)`, `index_by`, `push (array_push)`, `pop (array_pop)`, `unshift (array_unshift)`, `shift (array_shift)`, `remove (array_remove)`, `append`, `prepend`, `join`, `slice (array_slice)`, `keys (array_keys)`, `values (array_values)`, `entries (array_entries)`, `map`, `filter`, `some`, `every`, `find`, `findIndex`, `reduce`, `pick`, `unpick`
- **comparison:** `equals (eq)`, `not_equals (ne)`, `greater_than (gt)`, `greater_than_or_equal (gte)`, `less_than (lt)`, `less_than_or_equal (lte)`, `odd`, `even`, `in`, `not`, `bitwise_not`, `is_null (null)`, `is_empty (empty)`, `is_object`, `is_array`, `is_int`, `is_decimal`, `is_bool`, `is_text`
- **text:** `addslashes`, `escape`, `list_encodings`, `detect_encoding`, `to_utf8`, `from_utf8`, `convert_encoding`, `to_lower (lower)`, `to_upper (upper)`, `trim`, `ltrim`, `rtrim`, `capitalize`, `substr`, `split`, `strlen`, `strip_html (strip_tags)`, `unaccent (strip_accents)`, `index (strpos)`, `iindex (stripos)`, `starts_with`, `istarts_with`, `ends_with`, `iends_with`, `contains`, `icontains`, `url_addarg`, `url_delarg`, `url_hasarg`, `url_getarg`, `url_parse`, `querystring_parse`, `concat`, `sprintf`, `replace (string_replace)`, `regex_matches (regex_test)`, `regex_get_first_match (regex_match)`, `regex_get_all_matches (regex_match_all)`, `regex_quote`, `regex_replace`
- **manipulation:** `set`, `set_conditional`, `set_ifnotempty`, `set_ifnotnull`, `first_notnull`, `first_notempty`, `unset`, `transform`, `get`, `has`, `fill (array_fill)`, `fill_keys (array_fill_keys)`
- **transform:** `to_expr`, `to_text`, `to_int`, `to_decimal`, `to_bool`, `to_timestamp (to_epochms)`, `to_ms (to_epoch_ms)`, `to_seconds (to_epoch_sec)`, `to_minutes (to_epoch_minute)`, `to_hours (to_epoch_hour)`, `to_days (to_epoch_day)`, `create_object`, `create_object_from_entries`, `json_decode`, `json_encode`, `xml_decode`, `csv_parse`, `csv_decode`, `csv_encode`, `csv_create`, `url_decode`, `url_decode_rfc3986`, `url_encode`, `url_encode_rfc3986`, `yaml_decode`, `yaml_encode`, `hex2bin`, `bin2hex`, `dechex`, `hexdec`, `decbin`, `bindec`, `decoct`, `octdec`, `base_convert`, `base64_decode`, `base64_encode`, `base64_decode_urlsafe`, `base64_encode_urlsafe`
- **security:** `encrypt`, `decrypt`, `jws_encode (crypto_jws_encode)`, `jws_decode (crypto_jws_decode)`, `jwe_encode (crypto_jwe_encode)`, `jwe_decode (crypto_jwe_decode)`, `secureid_encode`, `secureid_decode`, `md5`, `sha1`, `sha256`, `sha384`, `sha512`, `hmac_md5`, `hmac_sha1`, `hmac_sha256`, `hmac_sha384`, `hmac_sha512`, `uuid (uuid4)`
- **timestamp:** `parse_timestamp (epochms_from_format)`, `format_timestamp (epochms_date)`, `transform_timestamp (epochms_transform)`, `add_secs_to_timestamp (epochms_add_secs)`, `add_ms_to_timestamp (epochms_add_ms)`

Naming traps: `min`/`max` on an array are canonically `min`/`max` (displayed `array_min`/`array_max`), while the two-number comparison versions are canonically `num_min`/`num_max` (displayed `min`/`max`) — the engine picks by input type. Timestamp filters take/return epoch-ms (`parse_timestamp`, `format_timestamp`, `transform_timestamp`). Do not invent filter names — if it is not in this list, it does not exist.

## Related Topics

| Topic | Use For |
|-------|---------|
| [expressions/filters](xano_xanoscript_docs({ topic: "expressions/filters" })) | Signatures, arguments, and examples for all 210 filters |
| [syntax](xano_xanoscript_docs({ topic: "syntax" })) | XanoScript operators, filters, and backtick expression mode |
| [syntax/array-filters](xano_xanoscript_docs({ topic: "syntax/array-filters" })) | Expression-argument higher-order filters (map/filter/reduce) and JS lambda filters |
| [syntax/string-filters](xano_xanoscript_docs({ topic: "syntax/string-filters" })) | String filter signatures and examples |
| [essentials](xano_xanoscript_docs({ topic: "essentials" })) | Common XanoScript patterns and mistakes |
