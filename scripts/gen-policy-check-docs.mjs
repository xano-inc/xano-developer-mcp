#!/usr/bin/env node
// Emit the "Check catalogue" + vocabulary sections of
// xano-developer-mcp/src/xanoscript_docs/policies.md from the live catalogue.
import { readFileSync } from 'fs';

const items = JSON.parse(readFileSync(process.argv[2], 'utf8')).items;
const SCOPE_KEYS = ['scope', 'api_groups', 'tables', 'verbs', 'tags', 'except_tags'];
const out = [];
const w = (l = '') => out.push(l);
const cell = s => String(s).replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();

w('## Check catalogue');
w();
w('A rule selects one built-in check and supplies literal parameters. Unknown check IDs and parameter names are rejected when saving. Read the instance catalogue (`GET /api:meta/workspace/{id}/policy/check` or `xano policy catalogue -o json`) for current types, defaults, allowed values, nested properties and examples.');
w();
w('Every entry carries a human `label` beside its id; that label is what names a rule whose author gave it no `title`. In the table, `name*` is required. `1 of (a, b)` requires at least one non-empty value or enabled boolean; each member is individually optional. Every check also accepts the shared scope parameters below.');
w();
w('| Check | Label | Behavior | Parameters |');
w('| --- | --- | --- | --- |');
for (const it of items) {
  const own = Object.keys(it.params).filter(n => !SCOPE_KEYS.includes(n));
  const oneOf = new Set(it.requires_one_of ?? []);
  const rendered = own
    .filter(n => !oneOf.has(n))
    .map(n => '`' + n + (it.params[n].required ? '*' : '') + '`');
  if (oneOf.size) rendered.unshift('1 of (' + [...oneOf].map(n => '`' + n + '`').join(', ') + ')');
  w(`| \`${it.id}\` | ${cell(it.label)} | ${cell(it.description)} | ${rendered.join(', ') || '_scope only_'} |`);
}
w();
w('Closed value sets worth knowing without a catalogue round-trip:');
w();
for (const it of items) {
  for (const [name, p] of Object.entries(it.params)) {
    if (SCOPE_KEYS.includes(name)) continue;
    const vs = p.values ?? p.items?.values;
    if (vs) w(`- \`${it.id}.${name}\`: ${vs.map(v => '`' + v + '`').join(', ')}`);
  }
}
w();
w('Nested object parameters and their keys:');
w();
for (const it of items) {
  for (const [name, p] of Object.entries(it.params)) {
    if (SCOPE_KEYS.includes(name) || !p.properties) continue;
    const keys = Object.keys(p.properties).map(k => '`' + k + '`').join(', ');
    w(`- \`${it.id}.${name}\` — keys ${keys}. Example: \`${JSON.stringify(p.example)}\``);
  }
}
w();
w('## Scoping a rule');
w();
w('Scope selects the objects a check inspects. All conditions must match; omitted or empty fields add no restriction. Individual check descriptions identify any branch-wide counts or related definitions consulted outside scope.');
w();
const scope = items[0].params.scope;
for (const [key, shape] of Object.entries(scope.properties)) {
  const vs = shape.values ? ` One of ${shape.values.map(v => '`' + (v === '' ? '""' : v) + '`').join(', ')}.` : '';
  w(`- \`scope.${key}\` (${shape.type}) — ${shape.description}${vs}`);
}
w();
w('Non-empty top-level `api_groups`, `tables`, `verbs` and `tags` replace the corresponding `scope` values. Top-level and nested `except_tags` combine. API group, HTTP verb and auth filters select queries only and exclude other object kinds.');
w();
w("Prefer tags to names. A rule scoped with `tags` or `except_tags` keeps working when an API group or table is renamed, and a new object opts in by carrying the tag; a rule scoped with `api_groups` or `tables` must be edited whenever those names change. A name the branch does not have selects nothing: the run reports it as a warning on the rule's result (`warnings`) without changing the result's status.");
w();
w('Example: `params = { statements: ["db.add", "db.edit"], scope: { object_kinds: ["query"], verbs: ["GET"] }, except_tags: ["generated"] }`.');
w();
w('## Writing parameter values');
w();
w('- **Types:** `string[]` is a list of strings; `bool` requires true or false. `number` accepts finite numeric literals, not numeric strings. Both `min_count` parameters are `integer` with minimum 1. Bounds are inclusive and use the checked parameter\'s native units; `unit` only labels findings.');
w('- **Object values:** use objects such as `{}` for selectors and maps. The catalogue publishes object defaults as `{}`. `value` in `table.field_attribute_required` accepts any literal, including null.');
w('- **Statement names:** use an exact XanoScript name such as `db.add` or `api.request`; stored aliases such as `mvp:dbo_add` also work. A misspelled name matches nothing, so verify it against statement documentation.');
w('- **Parameter paths:** use a name or dotted path such as `data.role`. Aliases include `per_page` for paging size, `where` for search conditions and `error` for the error message.');
w('- **References:** match a reference or its child paths. `$auth` matches `$auth.id`; `$input.id` does not match `$input.id2`. Supported roots are `$input`, `$auth`, `$env`, `$var`, `$error` and `$output`. Quoted text is literal.');
w('- **Literal comparison:** false differs from "false", and 0 differs from "0". Equal numbers match, including 1 and 1.0. Empty objects and lists share a stored representation and compare equally. This applies to forbidden literals, field attributes and setting equality.');
w('- **Names:** table, function, middleware, tag, field and provider names match exactly. Hosts and HTTP verbs ignore case. Regex and wildcards are not supported; credential `patterns` selects built-in shapes.');
w('- **Combined conditions:** field names and field types must match the same field; table selectors combine all conditions. Allowed write functions and tags are alternatives. `query.input_rules` needs an enabled condition and `statement.containment` needs a structural constraint. `statement.expression_rule` without extra constraints still requires the parameter to exist.');
w("- **Tags:** `tags`, `scope.tags` and `except_tags` match the inspected object's own tags; an endpoint also carries the tags of its API group. `query.tagged_table_access.tag` and `table_selector.tag` match table tags, and check parameters such as `public_tag` read only the object's own tags.");
w();
w('## Findings');
w();
w('A finding carries `policy_key`, `policy_title`, `rule_id`, `rule_title`, `severity`, an `object` reference and a `message` saying what was found and where in the stack. `rule_title` is the rule\'s own title, else its check\'s label, else its id; `severity` is the owning policy\'s, so every finding of one policy shares it. A finding `id` is prefixed with the policy key when the rule id does not already name it, so two policies whose rules share an id still produce distinct findings. Guidance that applies to the whole policy, such as how to request an exemption, belongs in the policy `statement`. Some catalogue entries carry an optional static `fix_hint` string describing the usual fix for that check; it is the same for every rule that uses the check.');
const hinted = items.filter(it => it.fix_hint);
if (hinted.length) {
  w();
  for (const it of hinted) w(`- \`${it.id}\`: ${String(it.fix_hint).trim()}`);
}
w();
w('A rule that inspected nothing reports `0 checked` rather than a pass, which is how "the scope matched no objects" is told apart from "everything satisfied the rule".');

process.stdout.write(out.join('\n') + '\n');
