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

- A documentação global já define o novo produto: aplicação web para cálculos e dimensionamentos elétricos.
- A prioridade agora é sair da base documental e começar a implementação funcional por módulos.
- A fase 1 está detalhada em `docs/phase-1-plan.md`.
- O módulo `auth` continua sendo o primeiro incremento funcional.
- Os próximos módulos de domínio são `projects` e `calculations`.

## Scope

- Acompanhar a implementação da fase 1 definida em `docs/phase-1-plan.md`.
- Manter visível o progresso de `auth`, `projects`, `calculations` e `web`.
- Atualizar a execução à medida que os docs do módulo forem sendo preenchidos e a implementação avançar.
- Garantir que as regras de domínio fiquem no backend e não na UI.

## Out of scope

- Reescrita ampla da arquitetura sem necessidade real.
- Automação avançada fora do MVP.

## Next steps

1. Começar por `auth`.
2. Evoluir `projects`.
3. Ligar o fluxo de `calculations`.
4. Montar a interface web.

## Blockers

- Falta de implementação inicial dos módulos.

## Validation

- Confirmar que a fase 1 segue o MVP e a arquitetura documentada.
- Confirmar que cada módulo nasce com documentação mínima antes da implementação.
- Confirmar que `auth`, `projects`, `calculations` e `web` avançam na ordem definida pela fase 1.

## Review criteria

- A fase 1 ainda representa o trabalho ativo?
- O escopo mudou a ponto de exigir novo plano?
- O plano deve ser pausado, concluído ou substituído?

## Status

- Fase 1 do produto em execução, com `auth` como primeiro incremento funcional e `projects` e `calculations` como próximos módulos de domínio.
