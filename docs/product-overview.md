# Product Overview

> Status: stable
> Type: architecture
> Last updated: 2026-04-21
> Owner: repository

Visão de produto para orientar leitura, módulos e decisões de documentação.

## What this is

- A web application for electrical studies, dimensioning, compliance, and technical planning.
- A product that keeps engineering rules in the backend and persists study data in a database.
- A system that needs authentication, project context, traceable calculations, route suggestions, estimates, reports, and a separate conformity layer.

## Product context

- The application is meant for engineering work, not infrastructure control.
- Users create or open electrical studies, enter areas, distances, loads, constraints, and site data, then review saved results.
- The system should model the installation first and then apply calculations, compliance checks, route suggestions, material choices, labor and equipment estimates, stage breakdowns, costs, and technical reports.
- Authentication remains necessary because saved studies, project data, and outputs are user-scoped.
- `standards` is the catalog of sources and technical criteria.
- `conformidade` is the validator that reads the electrical model and returns status, severity, applied rules, and required corrections.
- `knowledge` explains concepts, limits, and recommendations.
- `core` holds shared contracts, formulas, units, versioning, and audit primitives.

## Primary flows

- Authenticate into the application.
- Create or open an electrical study.
- Enter areas, distances, loads, circuits, and technical constraints.
- Model the installation by environments, loads, circuits, conductors, protection, and boards.
- Apply the relevant standard or technical rule set.
- Run electrical calculations and inspect intermediate values.
- Validate the result against compliance rules and document what changed.
- Compare route suggestions and installation alternatives.
- Review materials, labor, equipment, time, and cost estimates.
- Persist results for later review or revision.
- Present calculation outputs in a browser-friendly interface.
- Export or review technical reports and step-by-step execution guidance.

## Main areas

- `auth`: authentication, authorization, session handling, and access control.
- `projects`: electrical study lifecycle, metadata, and ownership.
- `standards`: norm catalog, versioning, applicability, and rule references.
- `calculations`: dimensioning and engineering rules.
- `conformidade`: validation of the calculated electrical model against legal and normative criteria.
- `routing`: route suggestion and path comparison for installation.
- `estimations`: materials, labor, equipment, time, and cost estimation.
- `reports`: technical reports, summaries, and step-by-step outputs.
- `knowledge`: glossary, help, explanations, and technical notes.
- `core`: shared contracts, formulas, units, versioning, and audit.
- `web`: browser UI for data entry, review, and output.

## Non-goals

- Provider-specific coupling in business logic.
- Putting engineering rules in the frontend.
- Hidden technical decisions with no traceability.
- Black-box automation that cannot be reviewed by an engineer.
- Turning compliance into the owner of the whole product. Compliance validates the model; it does not replace the modeling engine.

## Open questions

- The project mention of `ABNT NBR 5413` should be confirmed as a first-class lighting/illuminance subdomain, not the core electrical dimensioning standard.
- For the main electrical installation model, should the active base be `NBR 5410` and related standards, with lighting handled as a separate module or rule set?

## Documentation rule

- Use this file when you need the product context before entering module or architecture detail.
- Use `docs/mvp.md` when you need to separate the minimum necessary from future expansion.
