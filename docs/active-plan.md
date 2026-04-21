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

- A documentação global já define o novo produto: aplicação web para estudos elétricos, modelagem, dimensionamento, conformidade, estimativas e relatórios.
- A prioridade agora é sair da base documental e começar a implementação funcional por módulos.
- A primeira base visual em `Vite + React` e de persistência local já foi iniciada no MVP.
- A fase 1 está detalhada em `docs/phase-1-plan.md`.
- O módulo `auth` continua sendo o primeiro incremento funcional.
- Os próximos módulos de domínio passam a ser `projects`, `ambientes`, `cargas`, `circuitos`, `condutores`, `protecao`, `standards`, `calculations`, `conformidade` e `reports`.

## Scope

- Acompanhar a implementação da fase 1 definida em `docs/phase-1-plan.md`.
- Manter visível o progresso de `auth`, `projects`, `ambientes`, `cargas`, `circuitos`, `condutores`, `protecao`, `standards`, `calculations`, `conformidade`, `reports` e `web`.
- Atualizar a execução à medida que os docs do módulo forem sendo preenchidos e a implementação avançar.
- Garantir que as regras de domínio fiquem no backend e não na UI.

## Out of scope

- Reescrita ampla da arquitetura sem necessidade real.
- Automação avançada fora do MVP.

## Next steps

1. Começar por `auth`.
2. Evoluir `projects`.
3. Modelar `ambientes` e `cargas`.
4. Ligar `circuitos`, `condutores` e `protecao`.
5. Ligar o catálogo de `standards`.
6. Ligar o fluxo de `calculations`.
7. Conectar `conformidade` e `reports`.
8. Expandir a interface web e a persistência local.

## Blockers

- Falta de implementação inicial dos módulos.

## Validation

- Confirmar que a fase 1 segue o MVP e a arquitetura documentada.
- Confirmar que cada módulo nasce com documentação mínima antes da implementação.
- Confirmar que `auth`, `projects`, `ambientes`, `cargas`, `circuitos`, `condutores`, `protecao`, `standards`, `calculations`, `conformidade`, `reports` e `web` avançam na ordem definida pela fase 1.

## Review criteria

- A fase 1 ainda representa o trabalho ativo?
- O escopo mudou a ponto de exigir novo plano?
- O plano deve ser pausado, concluído ou substituído?

## Status

- Fase 1 do produto em execução, com `auth` como primeiro incremento funcional e o modelo eletrico como base para os proximos modulos de dominio.
