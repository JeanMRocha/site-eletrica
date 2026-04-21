# Nodes ADR

> Status: draft
> Type: index
> Last updated: 2026-04-21
> Owner: platform

## When to use

- Use ADR when the module makes a durable decision about control, inventory, or trust boundaries.
- Do not create ADR for trivial probe tweaks.

## Lifecycle

- `proposed`
- `accepted`
- `superseded`
- `deprecated`

## Current state

- The module uses SSH as its baseline control channel.
- Future ADRs should cover persistence, heartbeat, and any alternative remote control adapters.

