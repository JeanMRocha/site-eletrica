# Nodes Module

> Status: draft
> Type: module
> Last updated: 2026-04-21
> Owner: platform

Módulo responsável por inventário, telemetria e controle SSH das VPS e agentes.

## Escopo

- Inventário das máquinas monitoradas
- Canal SSH padrão para troubleshooting e manutenção
- Coleta inicial de saúde e inventário
- Base para heartbeat e telemetria futura

## Documentos do módulo

- [`rules.md`](rules.md): regras específicas do módulo
- [`contracts.md`](contracts.md): contratos do inventário e do conector SSH
- [`security.md`](security.md): controles de segurança do canal remoto
- [`tests.md`](tests.md): estratégia de testes do módulo
- [`reading-paths.md`](reading-paths.md): leitura mínima por tipo de mudança
- [`onboarding.md`](onboarding.md): guia de entrada para o módulo
- [`current-state.md`](current-state.md): estado vigente do módulo
- [`active-plan.md`](active-plan.md): plano em execução do módulo
- [`changelog.md`](changelog.md): histórico do módulo
- [`adr/README.md`](adr/README.md): regras de decisão do módulo
- [`archive/README.md`](archive/README.md): arquivo morto do módulo

## Navegação mínima

- `docs/governance.md`
- `docs/modules/nodes/reading-paths.md`
- `docs/modules/nodes/onboarding.md`
- `docs/modules/nodes/current-state.md`

## Maturidade do módulo

- A base de conector SSH já existe em Go.
- O inventário operacional da VPS principal já está modelado e exposto como leitura.
- Persistência de inventário e heartbeat ainda não foi criada.
- A API e a UI ainda vão consumir este módulo em etapas futuras.
