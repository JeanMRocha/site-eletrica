# Agent Instructions

Before making any change in this repository, an agent must:

1. Read `.agent`.
2. Read the architecture and stack documentation in `docs/`.
3. Produce or update an explicit plan before editing files.
4. Respect the planning phase if the user is still defining scope or architecture.
5. Avoid implementing code while the project is in documentation or decision mode unless the user explicitly asks for it.

Non-negotiable project rules:

- Prefer portabilidade and provider independence.
- Keep the core system containerized.
- Favor small, explicit modules over implicit framework magic.
- Prefer copying or owning project-specific UI/domain components over depending on fragile external abstractions.
- Keep production-critical logic in the Go API, not in the web layer.
- Treat `vinext` as the web experience layer, not the source of truth.
- Follow SOLID, clean boundaries, and testable design.
