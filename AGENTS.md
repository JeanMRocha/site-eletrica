# Agent Instructions

> Status: stable
> Type: rules
> Last updated: 2026-04-20
> Owner: repository

Start here:

1. Read `.agent`.
2. Read `docs/governance.md`.
3. Read the minimal docs required by the change.
4. Create or update an explicit plan before editing files.
5. Respect the planning phase if the user is still defining scope or architecture.
6. Avoid implementing code while the project is in documentation or decision mode unless the user explicitly asks for it.

Non-negotiable project rules:

- Prefer portabilidade and provider independence.
- Keep the core system containerized.
- Favor small, explicit modules over implicit framework magic.
- Prefer copying or owning project-specific UI/domain components over depending on fragile external abstractions.
- Keep production-critical logic in the Go API, not in the web layer.
- Treat `vinext` as the web experience layer, not the source of truth.
- Follow SOLID, clean boundaries, and testable design.
- Prefer tests before implementation when introducing new behavior.

If this file conflicts with `docs/governance.md`, governance wins.
