# Plan and result: prod-to-staging data and on-call prod access

## Plan

I read the policy skill, the template kit, and the workspace (`policy_authoring_eval`, 74 documents pulled). Both parts of your ask fall outside what a policy can check.

**Part 1: "production data never ends up in staging."** Policies read stored object definitions only. They never read table records, what a request sent or stored, or data copied between branches, environments or tenants. The platform lists "Runtime data and copies between environments" as not checkable. Any rule I could write would check something adjacent, such as whether a table has a tag or whether an endpoint calls an environment variable. That would look like a control and would not be one, so I won't write it.

**Part 2: "devs can only reach prod through the on-call process."** Who holds access, and who approved a change, happens outside the definitions. The platform lists "Access reviews and change approvals" as not checkable. A blocking policy can hold a merge but cannot see who signed it off.

**Objects to build:** none.
**Changes to existing objects:** none.
**Policy:** none. The skill says to write no policy when no part of the request is checkable, and that applies here.

**What stays unchecked:** both parts of the ask.

## Result

Nothing was built or changed. No `workspace/policies/*.xs` file was written, and I ran no push, not even a dry run, because there is nothing to preview. The `workspace/` tree is the untouched pull.

## Before you push anything

There is nothing to push from this change. For the two controls you want, you will need enforcement outside Xano policies:

- **Prod data never reaches staging:** enforce this with your data-handling process, such as restricted export and restore procedures, and with environment separation in your hosting setup. A policy cannot read the records being copied.
- **Prod access only via on-call:** enforce this in your identity provider and access-review process, with time-limited, approved grants. A policy cannot see who holds access or who approved it.

If part of this maps to something checkable later, such as a rule that a specific cleanup or export function is attached to a restricted table, tell me which object and I will plan that one separately.
