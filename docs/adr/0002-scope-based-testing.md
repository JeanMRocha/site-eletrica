# Scope-Based Testing

> Status: stable
> Type: architecture
> Last updated: 2026-04-20
> Owner: repository

## Context

The repository needs a testing approach that avoids unnecessary gates during development while still enforcing strong validation before integration.

## Decision

Use scope-based testing:

- run tests for the affected module during development
- run the full repository suite before commit or pull request
- apply stricter security gates for critical modules such as auth
- create or update tests before implementing new behavior

## Consequences

- Development stays focused on the affected area.
- Critical modules keep stronger validation.
- Integration points remain protected by full-suite validation before publishing changes.

## Alternatives considered

- Run the full suite for every change.
- Run only the affected test file.
- Delay all validation until commit time.

## Status

- Decision accepted
