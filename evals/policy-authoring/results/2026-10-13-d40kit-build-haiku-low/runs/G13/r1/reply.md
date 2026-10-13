# Plan and result: security training before touching customer data

## Plan

I checked whether any policy check can do what you asked. It can't, so the plan is to build nothing.

**Why no check fits:** Policies read stored object definitions in the workspace: tables, endpoints, functions, tags, middleware and so on. Whether a person on the team has completed security awareness training is a fact about people, and no check reads it. The platform's own guidance lists "People and training" as something no policy can see.

**What I considered and rejected:**

- **A training-gate middleware or table.** I could build a `training_completed` flag on the users table and a middleware that refuses calls to customer-data tables unless the flag is set. That would check a self-reported flag that someone has to set by hand. Nothing ties it to a real training record, and it would make a policy look like it enforces training when it does not. Your own rule (make sure everyone *has done* the training) would not be met by it.
- **Tagging customer-data tables and requiring login on them.** This is real, checkable coverage: `object.tagged_table_access` (CONF-010) can require that endpoints reaching tables tagged `pii` require login. But it controls *who can call the endpoint*, not *whether the people on your team were trained*. Presenting it as the training control would be misleading.

## What I built and changed

Nothing. No objects were created or changed under `workspace/`, no policy files were written, and I ran no push, including the dry run, since there was nothing to validate.

## What you should know before doing anything else

- **Nothing in Xano can prove a team member completed security awareness training.** Training records live with your training provider or HR system. Xano policies cannot see them.
- **What a policy can check, if you want it:** that customer-data tables are tagged, that the endpoints reaching them require login, and that those endpoints record each access. Those are controls on the system, not on people. I can build them as a separate change if you want, but they would not satisfy the training requirement.
- **To enforce training, you need a process outside Xano:** for example, granting access to the workspace and customer-data environments only after training is confirmed in your training system, and reviewing access periodically. An access review is also outside what policies can see.
- **Confidence the request is met by a policy: none.** The gap is a property of the platform, not something a rule here could close.
