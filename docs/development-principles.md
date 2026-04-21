# Development Principles

> Status: stable
> Type: principles
> Last updated: 2026-04-21
> Owner: platform

## Working style

- Plan first
- Implement second
- Validate last
- Keep changes small and reviewable

## Architecture principles

### SOLID

- Single Responsibility: each module should do one job
- Open/Closed: extend behavior through composition or policy, not constant rewrites
- Liskov Substitution: abstractions must be honest and replaceable
- Interface Segregation: keep interfaces narrow
- Dependency Inversion: core logic depends on abstractions, not concrete implementations

### Complementary principles

- Prefer composition over inheritance
- Prefer explicit boundaries over hidden coupling
- Keep side effects isolated
- Make state transitions obvious
- Make failure paths explicit

## Backend principles

- The API owns business rules
- Handlers should be thin
- Services should be deterministic when possible
- Repositories should hide persistence details
- Domain rules for calculations must stay out of the frontend

## Frontend principles

- The UI must be a consumer of API contracts
- Keep presentational components dumb when possible
- Keep product-specific components in the repo
- Avoid turning the frontend into the place where engineering rules live
- Primary screens must be consolidation views, not raw data-entry forms
- Use tabs to separate domain areas; place creation and edit actions as secondary flows inside the relevant tab
- Do not expose standalone "cadastro" screens as primary navigation items
- Prefer split responsibilities over monolithic components and screens
- Extract reusable layout, behavior, and domain contracts early enough to avoid copy-paste growth

## Reliability principles

- Idempotent operations are preferred
- Technical outputs must be traceable to inputs
- Every saved calculation should be reproducible
- Fail closed when data is incomplete or inconsistent

## Testing principles

- Test the rules, not only the UI
- Keep unit tests close to the business logic
- Add integration tests for API and persistence boundaries
- Add end-to-end tests only for critical flows
- Create or update the relevant tests before implementing new behavior
- Run module-scoped tests during development
- Run the full test suite before commit or pull request

## Security principles

- Use least privilege
- Protect secrets outside the repository
- Authenticate access to saved projects and calculations
- Log security-relevant actions

## Documentation principles

- Document decisions, not just features
- Record tradeoffs and rejected options
- Keep architecture docs updated when the stack changes
- Keep product and operational docs in `pt-BR`
- Keep technical contracts, ADRs, and implementation details in consistent technical English unless a mixed-language format is intentional and documented
