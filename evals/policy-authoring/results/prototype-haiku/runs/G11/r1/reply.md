I have drafted two policies for timeouts and error handling on external calls. They parse, but I have not published them, and I have not run an evaluation because I only had access to your policy files here.

- **SEC-013** (timeouts): every api.request, stream.from_request and webflow.request must set a timeout of 30 seconds or less. The second rule requires the timeout to be written out, because an omitted one is only judged at its 10-second default.
- **LOG-010** (error handling): every api.request and stream.from_request must sit inside a try block. This means a vendor outage reaches your error handling instead of hanging or failing the whole stack.

What these do not guarantee:
- LOG-010 only checks that the call is wrapped in try. It does not check that the catch branch handles the failure, so review the handlers yourself.
- The timeout checks cover only the statements listed here. Other calls, such as MCP and direct database calls, are not covered.
- A pass only means the stored definitions matched when the rule ran. It does not prove your app will survive the next vendor outage.

Before you publish, tell me whether any of your vendor calls go through a different statement, such as webflow.request or a database external call. I can add them to the rules.
