# Product Overview

> Status: stable
> Type: architecture
> Last updated: 2026-04-21
> Owner: repository

Visão de produto para orientar leitura, módulos e decisões de documentação.

## What this is

- A web application for electrical calculations and dimensioning.
- A product that keeps engineering rules in the backend and persists technical studies in a database.
- A system that needs authentication, project context, traceable calculations, and a browser-based interface.

## Product context

- The application is meant for engineering work, not infrastructure control.
- Users create or open electrical projects, run calculations, and review saved results.
- Authentication remains necessary because saved studies, project data, and outputs are user-scoped.

## Primary flows

- Authenticate into the application.
- Create or open an electrical project.
- Enter technical data needed for dimensioning.
- Run electrical calculations and inspect intermediate values.
- Persist results for later review or revision.
- Present calculation outputs in a browser-friendly interface.

## Main areas

- `auth`: authentication, authorization, session handling, and access control.
- `projects`: electrical project lifecycle, metadata, and ownership.
- `calculations`: dimensioning and engineering rules.
- `catalogs`: reusable electrical reference data, tables, and presets.
- `web`: browser UI for data entry, review, and output.

## Non-goals

- Provider-specific coupling in business logic.
- Putting engineering rules in the frontend.

## Documentation rule

- Use this file when you need the product context before entering module or architecture detail.
- Use `docs/mvp.md` when you need to separate the minimum necessary from future expansion.
