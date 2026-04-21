# Auth Module

> Status: draft
> Type: module
> Last updated: 2026-04-20
> Owner: security

Módulo responsável por autenticação, autorização e controle de sessão.

## Escopo

- Login
- Refresh de sessão
- Logout e revogação
- Emissão e validação de tokens
- Regras de autorização de acesso

## Documentos do módulo

- [`rules.md`](rules.md): regras específicas do módulo
- [`contracts.md`](contracts.md): contratos e formatos esperados
- [`security.md`](security.md): controles de segurança e riscos
- [`tests.md`](tests.md): testes e gates do módulo
- [`active-plan.md`](active-plan.md): execução atual do módulo
- [`changelog.md`](changelog.md): histórico de mudanças do módulo
- [`plan-template.md`](plan-template.md): modelo oficial de plan do módulo
- [`current-state-template.md`](current-state-template.md): modelo oficial de current-state do módulo
- [`adr/README.md`](adr/README.md): regras de decisão do módulo
- [`adr/template.md`](adr/template.md): modelo oficial de ADR do módulo
- [`adr/0001-auth-governance.md`](adr/0001-auth-governance.md): decisão inicial do módulo
- [`adr/current-state.md`](adr/current-state.md): estado vigente do módulo
- [`adr/archive/README.md`](adr/archive/README.md): arquivo morto do módulo

## Leitura mínima para alteração

- `docs/architecture.md`
- `docs/development-principles.md`
- `docs/agent-rules.md`
- `docs/modules/README.md`
- Este diretório do módulo

## Regra prática

- Se a mudança não tocar auth, não leia estes arquivos por padrão.
- Se a mudança tocar auth, trate este módulo como crítico e aplique gates mais rígidos.
