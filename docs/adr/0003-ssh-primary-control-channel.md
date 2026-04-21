# SSH Primary Control Channel

> Status: accepted
> Type: adr
> Last updated: 2026-04-21
> Owner: platform

## Context

The project needs a portable way to control VPS instances, inspect runtime state, and perform safe remediation without depending on a single provider.

The system also needs a separate path for observability so telemetry can remain lightweight and independent from operator access.

## Decision

- Use SSH as the default operator control channel for the first production implementation.
- Use SSH for bootstrap, troubleshooting, controlled maintenance, and other explicit remote actions.
- Keep telemetry and heartbeats separate, using outbound HTTPS from node agents to the API.
- Treat provider APIs, remote consoles, and other mechanisms as optional adapters, not the primary contract.

## Alternatives considered

- Provider API as the primary control channel.
  - Rejected because it increases provider coupling and limits portability.
- Telemetry-only agents without SSH.
  - Rejected because they reduce operator control and make remediation harder.
- Full custom remote execution fabric.
  - Rejected because it adds complexity before the control plane proves its value.

## Consequences

- The first implementation can support most environments with a standard SSH user and key-based access.
- The control plane stays provider-independent by default.
- Other control paths can be added later as adapters without changing the default model.
- The system must document and audit SSH usage carefully.

## Review criteria

- SSH remains the simplest and safest control path for the initial operating model.
- Telemetry stays separate from control actions.
- New adapters can be added without breaking the default SSH workflow.

