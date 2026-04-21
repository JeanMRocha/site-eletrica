# Auth Changelog

> Status: active
> Type: history
> Last updated: 2026-04-20
> Owner: security

Registro de mudanças do módulo de autenticação.

## Entradas

### 2026-04-20

- Mudança: criado o esqueleto de decisão do módulo `auth` com ADRs iniciais.
- Motivo: registrar governança local para autenticação, sessão e segurança.
- Impacto: o módulo ganhou trilha de decisão própria para futuras implementações.
- Arquivos: `docs/modules/auth/adr/README.md`, `docs/modules/auth/adr/0001-auth-governance.md`, `docs/modules/auth/adr/0002-session-model.md`

### 2026-04-20

- Mudança: criado o esqueleto de documentação do módulo `auth`.
- Motivo: isolar regras, contratos, segurança e testes em uma área própria.
- Impacto: o agente pode ler apenas os documentos do módulo quando a alteração for local.
- Arquivos: `docs/modules/auth/README.md`, `docs/modules/auth/rules.md`, `docs/modules/auth/contracts.md`, `docs/modules/auth/security.md`, `docs/modules/auth/tests.md`, `docs/modules/auth/active-plan.md`, `docs/modules/auth/changelog.md`
