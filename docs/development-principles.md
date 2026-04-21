# Development Principles

> Status: stable
> Type: principles
> Last updated: 2026-04-20
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
- External integrations should be wrapped behind adapters

## Frontend principles

- The UI must be a consumer of API contracts
- Keep presentational components dumb when possible
- Keep product-specific components in the repo
- Avoid turning the frontend into the place where business rules live

## Reliability principles

- Idempotent operations are preferred
- Remediation actions must be safe by default
- Every automated action should be auditable
- Health checks must fail closed when uncertain

## Testing principles

- Test the rules, not only the UI
- Keep unit tests close to the business logic
- Add integration tests for API and persistence boundaries
- Add end-to-end tests only for critical flows

## Security principles

- Use least privilege
- Protect secrets outside the repository
- Sign or authenticate agent traffic
- Assume every node can be compromised individually
- Log security-relevant actions

## Documentation principles

- Document decisions, not just features
- Record tradeoffs and rejected options
- Keep architecture docs updated when the stack changes
