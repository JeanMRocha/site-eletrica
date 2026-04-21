# Auth Module

> Status: stable
> Type: module
> Last updated: 2026-04-21
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
- [`onboarding.md`](onboarding.md): guia de entrada para quem está conhecendo o módulo
- [`current-state.md`](current-state.md): estado vigente do módulo
- [`active-plan.md`](active-plan.md): execução atual do módulo
- [`changelog.md`](changelog.md): histórico de mudanças do módulo
- [`plan-template.md`](plan-template.md): modelo oficial de plan do módulo
- [`plan-lifecycle.md`](plan-lifecycle.md): política de ciclo de vida de plan do módulo
- [`current-state-template.md`](current-state-template.md): modelo oficial de current-state do módulo
- [`current-state-lifecycle.md`](current-state-lifecycle.md): política de ciclo de vida de current-state do módulo
- [`adr/README.md`](adr/README.md): regras de decisão do módulo
- [`adr/template.md`](adr/template.md): modelo oficial de ADR do módulo
- [`adr/0001-auth-governance.md`](adr/0001-auth-governance.md): decisão inicial do módulo
- [`adr/current-state.md`](adr/current-state.md): snapshot da camada de decisão do módulo
- [`adr/archive/README.md`](adr/archive/README.md): arquivo morto do módulo
- [`archive/README.md`](archive/README.md): arquivo morto de plan e current-state do módulo

## Navegação mínima

- Use `docs/governance.md` como autoridade principal.
- Use `docs/modules/auth/onboarding.md` quando estiver entrando no módulo pela primeira vez.
- Use `docs/modules/auth/current-state.md` quando precisar do estado vigente.
- Abra os demais documentos do módulo apenas quando o tipo de mudança exigir.

## Maturidade do módulo

- A navegação, os contratos, os testes e os controles de segurança já têm estrutura estável.
- Alguns documentos ainda são guias de preparação e devem ser refinados conforme a aplicação crescer.
- `current-state.md` representa o estado vivo.
- `adr/current-state.md` representa apenas o snapshot histórico da camada de decisão.

## Regra prática

- Se a mudança não tocar auth, não leia estes arquivos por padrão.
- Se a mudança tocar auth, trate este módulo como crítico e aplique gates mais rígidos.
- Se houver conflito entre este índice e `docs/governance.md`, a governança vence.
