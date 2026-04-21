# Plano em Execução

> Status: active
> Type: plan
> Last updated: 2026-04-21
> Owner: repository

Use este documento para registrar trabalho em andamento no nível global do repositório.

## Lifecycle

- `active`: trabalho em execução.
- `paused`: trabalho bloqueado ou suspenso temporariamente.
- `completed`: trabalho concluído.

## Contexto

- A documentação já definiu governança, MVP e processo para novos módulos.
- O trabalho agora deve sair da fase de documentação e entrar na primeira implementação funcional.
- O plano global atual passa a acompanhar a fase 1 do produto.
- A decomposição detalhada da fase 1 está em `docs/phase-1-plan.md`.
- A primeira implementação funcional do módulo `auth` já foi iniciada em Go.
- A base do módulo `nodes` foi iniciada com um conector SSH e probe de inventário mínimo.
- O inventário operacional da VPS principal já está exposto como leitura no módulo `nodes`.

## Scope

- Acompanhar a implementação da fase 1 definida em `docs/phase-1-plan.md`.
- Manter visível o progresso de `auth`, `nodes`, `incidents` e `dashboard`.
- Atualizar a execução à medida que os docs do módulo forem sendo preenchidos e a implementação avançar.
- Evoluir `nodes` para inventário, persistência e heartbeat após a base SSH inicial.
- Evoluir `nodes` para persistência e heartbeat depois do inventário operacional inicial.

## Out of scope

- Mudanças de governança documental já concluídas.
- Reescrita ampla da arquitetura sem necessidade real.
- Automação avançada fora do MVP.

## Next steps

1. Começar por `auth`.
2. Evoluir a base de `nodes`.
3. Ligar o fluxo de incidentes.
4. Montar o painel consolidado.

## Blockers

- Falta de implementação inicial dos módulos.

## Validation

- Confirmar que a fase 1 segue o MVP e a arquitetura documentada.
- Confirmar que cada módulo nasce com documentação mínima antes da implementação.
- Confirmar que `auth`, `nodes`, `incidents` e `dashboard` avançam na ordem definida pela fase 1.

## Review criteria

- A fase 1 ainda representa o trabalho ativo?
- O escopo mudou a ponto de exigir novo plano?
- O plano deve ser pausado, concluído ou substituído?

## Status

- Fase 1 do produto em execução, com `auth` iniciado como primeiro incremento funcional e `nodes` com inventário operacional inicial.
