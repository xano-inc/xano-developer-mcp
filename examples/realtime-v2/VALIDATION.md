# Validation coverage

The examples were executed against a Realtime V2 test instance. This is validation evidence, not a production deployment or an instruction to use an internal environment.

The live checks cover independent clients, room isolation, channel/sender/others delivery, server-side publishing, successful post middleware merge/replace, typed message validation, negative authentication, and unknown-channel rejection. Application JWT authentication and join authorization passed during the initial audit. A later run without a JWT explicitly skipped the positive authentication check.

The MCP build and 269 offline tests passed before the production-language audit. The final release checks are recorded separately.

The visual Realtime Publish panel was checked against merged implementation source; it was not interactively retested in that follow-up. Optional identity attribution, durable replay/acknowledgement, presence, history, rate limiting, explicit recipients, and non-join lifecycle triggers are outside the live examples’ coverage.

Configure the examples for your own instance before running them. Successful parsing or an HTTP response does not prove delivery; assert received WebSocket message frames.
