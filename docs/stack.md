# Stack

> Status: stable
> Type: stack
> Last updated: 2026-04-21
> Owner: platform

## Chosen stack

- Web: `vinext`
- API: `Go`
- Database: `PostgreSQL`
- Runtime: Docker

## Why this stack

- `vinext` gives a modern browser interface for technical forms and result review
- `Go` keeps the backend deterministic, fast, and easy to reason about
- `PostgreSQL` is reliable for projects, calculation history, and traceable results
- Docker preserves portability across environments

## Component ownership policy

- Copy or own project-specific UI components when they are stable and meaningful to the product
- Prefer in-repo implementation for engineering rules and calculation logic
- Avoid hard dependency chains for core behavior
- Do not vendor large frameworks or low-level infrastructure libraries

### Good candidates to own in the repo

- Forms, project views, result panels, tables, charts, and summaries
- Validation rules specific to the electrical domain
- Electrical calculation and dimensioning logic
- API clients and DTO adapters
- Catalog tables and reusable presets

### Bad candidates to copy

- HTTP frameworks
- Database drivers
- Authentication primitives
- Cryptography primitives
- Observability backends
- General-purpose UI libraries with good maintenance and clear upgrades

## Deployment shape

- Each deployable service must have its own Dockerfile or clear build instructions
- Dev, staging, and production configs must be separated
- Infrastructure assumptions must be documented, not hidden in code
- Secrets must live outside the repository and be injected by environment
