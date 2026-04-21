# Auth Changelog

> Status: active
> Type: history
> Last updated: 2026-04-20
> Owner: security

Registro de mudanças do módulo de autenticação.

## Entradas

### 2026-04-20

- Mudança: criado `reading-paths.md` no módulo `auth` para orientar leitura mínima por tipo de alteração.
- Motivo: evitar abrir documentação de auth fora do escopo imediato e tornar o trabalho no módulo mais eficiente.
- Impacto: tarefas de login, sessão, segurança, operação e revisão têm caminhos mínimos explícitos.
- Arquivos: `docs/modules/auth/reading-paths.md`, `docs/modules/auth/README.md`

### 2026-04-20

- Mudança: reorganizado o módulo `auth` com `current-state` vivo, runbook operacional, contrato expandido e snapshots de decisão separados.
- Motivo: deixar auth mais claro para desenvolvimento, operação e manutenção profissional.
- Impacto: o módulo passou a ter documentação mais útil para mudanças locais e incidentes.
- Arquivos: `docs/modules/auth/current-state.md`, `docs/modules/auth/runbook.md`, `docs/modules/auth/contracts.md`, `docs/modules/auth/README.md`, `docs/modules/auth/adr/current-state.md`
