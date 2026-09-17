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
w('A rule names one check and supplies its literal parameters. Unknown check ids and unknown parameter names are refused when the policy is saved, so build only from this list and read the LIVE catalogue (`GET /api:meta/workspace/{id}/policy/check`, or `xano policy catalogue -o json`) for each parameter\'s full description, closed value set, nested shape and worked example.');
w();
w('Notation below: `name*` is REQUIRED (a rule without it is refused); `1 of (a, b)` means each is individually optional but a rule supplying neither is refused; everything else is optional and falls back to the default published in the catalogue. Every check additionally accepts the five shared scope parameters documented under "Scoping a rule".');
w();
w('| Check | Reports | Parameters |');
w('| --- | --- | --- |');
for (const it of items) {
  const first = it.description.split(/(?<=\.)\s/)[0];
  const own = Object.keys(it.params).filter(n => !SCOPE_KEYS.includes(n));
  const oneOf = new Set(it.requires_one_of ?? []);
  const rendered = own
    .filter(n => !oneOf.has(n))
    .map(n => '`' + n + (it.params[n].required ? '*' : '') + '`');
  if (oneOf.size) rendered.unshift('1 of (' + [...oneOf].map(n => '`' + n + '`').join(', ') + ')');
  w(`| \`${it.id}\` | ${cell(first)} | ${rendered.join(', ') || '_scope only_'} |`);
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
w('Every check carries the same five scope parameters. They narrow WHICH objects the rule inspects and never change what the check looks for. All conditions AND together; an omitted or empty one adds no restriction.');
w();
const scope = items[0].params.scope;
for (const [key, shape] of Object.entries(scope.properties)) {
  const vs = shape.values ? ` One of ${shape.values.map(v => '`' + (v === '' ? '""' : v) + '`').join(', ')}.` : '';
  w(`- \`scope.${key}\` (${shape.type}) — ${shape.description}${vs}`);
}
w();
w('`api_groups`, `tables`, `verbs`, `tags` and `except_tags` may also be written at the top level of `params` as shorthands for the matching `scope` key. `scope.api_groups`, `scope.verbs` and `scope.auth` describe QUERIES: setting any of them on a check that inspects several kinds drops every non-query object from the rule.');
w();
w("Prefer tags to names. A rule scoped with `tags` or `except_tags` keeps working when an API group or table is renamed, and a new object opts in by carrying the tag; a rule scoped with `api_groups` or `tables` must be edited whenever those names change. A name the branch does not have selects nothing: the run reports it as a warning on the rule's result (`warnings`) without changing the result's status.");
w();
w('Example: `params = { statements: ["db.add", "db.edit"], scope: { object_kinds: ["query"], verbs: ["GET"] }, except_tags: ["generated"] }`.');
w();
w('## Writing parameter values');
w();
w('These rules apply wherever a check takes a statement name, a parameter name, a reference or a literal.');
w();
w('- **Statement names** are XanoScript names: `db.add`, `db.edit`, `db.patch`, `db.del`, `db.query`, `db.get`, `db.truncate`, `db.direct_query`, `db.bulk.delete`, `api.request`, `function.run`, `util.send_email`, `util.get_all_input`, `security.encrypt`, `security.create_auth_token`, `debug.log`, `precondition`, `throw`, `try_catch`, `conditional`, `foreach`, `while`, `for`, `switch`, `group`, `var`, `expect.to_throw`. The stored `mvp:*` name is accepted too. A name that matches no statement never matches anything and is NOT reported as an error, so verify the spelling against the statement docs.');
w('- **Parameter names** are resolved on the statement in this order: its `context`/`params`/`process` block, then its named input assignments, then the statement node itself. A dotted path reaches into an object field (`data.role`). Three aliases are understood: `per_page` (db.query `return.list.paging.per_page`), `where` (`search`) and `error` (`message`).');
w('- **References** (`must_reference`, `must_not_reference`, `compare_to`, `before.must_reference`) match exactly or by prefix, so `$auth` also matches `$auth.id`. The roots that can appear are `$input`, `$auth`, `$env`, `$var`, `$error`, `$output`. Text inside quotes is a literal, not a reference.');
w('- **Literal lists** (`values`, `literals_forbidden`) compare with exact type: `[false]` matches the boolean `false` but not the string `"false"`, and `[0]` does not match `"0"`.');
w('- **Names are matched exactly.** There are no wildcards or regular expressions anywhere — not on `hosts`, `api_groups`, `tables` or `field_names`. `literal.credential_shape.patterns` is a closed set of named shapes, not a pattern you write.');
w('- **Tags**: `tags` / `scope.tags` and `except_tags` match the tags ON the inspected object; an endpoint also carries the tags of its API group. `query.tagged_table_access.tag` and `table_selector.tag` match TABLE tags instead, and check parameters such as `public_tag` read only the object\'s own tags.');
w();
w('## Findings');
w();
w('A finding carries `policy_key`, `policy_title`, `rule_id`, `rule_title`, `severity`, an `object` reference and a `message` saying what was found and where in the stack. Guidance that applies to the whole policy, such as how to request an exemption, belongs in the policy `statement`. Some catalogue entries carry an optional static `fix_hint` string describing the usual fix for that check; it is the same for every rule that uses the check.');
const hinted = items.filter(it => it.fix_hint);
if (hinted.length) {
  w();
  for (const it of hinted) w(`- \`${it.id}\`: ${String(it.fix_hint).trim()}`);
}
w();
w('A rule that inspected nothing reports `0 checked` rather than a pass, which is how "the scope matched no objects" is told apart from "everything satisfied the rule".');

process.stdout.write(out.join('\n') + '\n');
