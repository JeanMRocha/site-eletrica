# Architecture

> Status: stable
> Type: architecture
> Last updated: 2026-04-21
> Owner: platform

## Goal

Build a web application that stores electrical projects, runs calculations and dimensioning rules, and presents the results through a browser-based interface.

## High-level design

- Web layer: `vinext`
- API layer: `Go`
- Persistence: `PostgreSQL`
- Runtime: Docker
- Authentication: dedicated `auth` module
- Domain modules: `projects`, `calculations`, `catalogs`, and future engineering areas

## Responsibilities

### Web layer

- Present projects, inputs, results, and comparison views
- Collect user input for calculations
- Keep presentation logic separate from engineering rules
- Never be the source of truth for calculations

### Go API

- Own authentication and authorization decisions
- Validate request payloads
- Execute engineering and dimensioning rules through services
- Persist projects, calculation runs, and derived outputs
- Expose stable, versioned endpoints

### Domain services

- Encapsulate electrical formulas and decision rules
- Keep calculation inputs explicit and reproducible
- Return traceable intermediate values when needed
- Avoid hidden state inside the UI layer

### Persistence

- Store user accounts, projects, calculation runs, domain catalogs, and audit history
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

## Runtime posture

- Everything deployable should be container-friendly.
- Use environment variables and secrets management for deployment-specific data.
- Avoid hard dependency on provider-specific services in the core logic.
