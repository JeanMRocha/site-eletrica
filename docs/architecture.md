# Architecture

> Status: stable
> Type: architecture
> Last updated: 2026-04-21
> Owner: platform

## Goal

Build a web application that stores electrical studies, models installations, runs calculations, validates compliance, suggests installation routes, generates estimates, and presents the results through a browser-based interface.

## High-level design

- Web layer: `vinext`
- API layer: `Go`
- Persistence: `PostgreSQL`
- Runtime: Docker
- Authentication: dedicated `auth` module
- Domain modules: `projects`, `standards`, `calculations`, `conformidade`, `routing`, `estimations`, `reports`, `knowledge`, `core`, and future engineering areas

## Responsibilities

### Web layer

- Present studies, inputs, results, estimates, and comparison views
- Collect user input for modeling, calculations, compliance review, and route estimation
- Keep presentation logic separate from engineering rules
- Never be the source of truth for calculations or costs

### Go API

- Own authentication and authorization decisions
- Validate request payloads
- Execute engineering, dimensioning, and compliance rules through services
- Persist studies, calculation runs, compliance snapshots, route alternatives, estimates, and derived outputs
- Expose stable, versioned endpoints

### Domain services

- Encapsulate electrical formulas, decision rules, and validation adapters
- Keep calculation inputs explicit and reproducible
- Resolve standards and versioned criteria before calculations execute
- Suggest route alternatives and compute estimates as separate services
- Keep conformity as a validator that consumes the model and returns verdicts
- Keep knowledge content explanatory, not authoritative
- Return traceable intermediate values when needed
- Avoid hidden state inside the UI layer

### Persistence

- Store user accounts, studies, model snapshots, calculation runs, conformity verdicts, domain catalogs, standards versions, route alternatives, estimates, report snapshots, and audit history
- Preserve enough history to reproduce important technical results
- Keep read models and write models simple enough to evolve

## Operational intent

- Keep the application portable across environments.
- Keep engineering logic in the backend.
- Keep the frontend focused on usability and review.
- Make outputs reviewable, traceable, and suitable for technical work.

## Communication model

- The browser talks to the API through versioned endpoints.
- The API talks to PostgreSQL through repository or data-access abstractions.
- Domain rules stay inside services or calculation engines, not in controllers.
- The conformity engine receives structured model output and returns status, severity, rule ids, and correction guidance.

## Shared model

- The core domain should center on project, environment, load, circuit, conductor, protection, board, route, material, and technical result.
- Compliance should read the model instead of becoming the model.
- Shared contracts, units, formulas, version identifiers, and audit metadata belong in `core`.

## Runtime posture

- Everything deployable should be container-friendly.
- Use environment variables and secrets management for deployment-specific data.
- Avoid hard dependency on provider-specific services in the core logic.
