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
- Control plane deployment: Coolify
- Remote node: Oracle Free Tier
- Local virtualization: Proxmox
- Primary remote control: SSH

## Why this stack

- `vinext` gives a modern web experience with Cloudflare alignment
- `Go` keeps the critical backend small, fast, and portable
- `PostgreSQL` is reliable for state, history, and auditing
- Docker preserves portability across providers
- Coolify matches the current operational workflow
- Proxmox fits a lab and support role well
- SSH is the simplest portable control path across providers and hosts

## Component ownership policy

- Copy or own project-specific UI components when they are stable and meaningful to the product
- Prefer in-repo implementation for domain logic
- Avoid hard dependency chains for core behavior
- Do not vendor large frameworks or low-level infrastructure libraries

### Good candidates to own in the repo

- Tables, forms, dashboards, charts, cards
- Validation rules specific to this product
- Health evaluation logic
- Remediation orchestration logic
- API clients and DTO adapters

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
- SSH credentials for nodes must be managed as deployment-specific secrets
