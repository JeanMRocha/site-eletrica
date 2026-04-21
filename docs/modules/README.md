# Modules

> Status: stable
> Type: index
> Last updated: 2026-04-20
> Owner: repository

Camada de documentação por módulo. Use esta pasta para concentrar regras, contratos, testes e histórico de cada área funcional.

## Regra de leitura por escopo

- `docs/governance.md` é a autoridade principal para navegação por documentação.
- `docs/modules/<modulo>/reading-paths.md` é o guia mínimo quando a mudança ficar restrita a um módulo.
- Leia os documentos do módulo afetado, sem carregar módulos não relacionados por padrão.

## Estrutura sugerida por módulo

- `README.md`: objetivo, escopo e links do módulo
- `rules.md`: regras específicas do módulo
- `contracts.md`: contratos, DTOs, endpoints e formatos esperados
- `security.md`: riscos, controles e exigências de segurança
- `tests.md`: estratégia de testes e gates do módulo
- `runbook.md`: procedimentos operacionais do módulo
- `onboarding.md`: guia de entrada do módulo quando ele precisar de mais contexto
- `active-plan.md`: execução atual do módulo
- `current-state.md`: estado vigente do módulo
- `changelog.md`: histórico de mudanças do módulo
- `plan-template.md`: modelo oficial de plan do módulo
- `plan-lifecycle.md`: política de ciclo de vida de plan do módulo
- `current-state-template.md`: modelo oficial de current-state do módulo
- `current-state-lifecycle.md`: política de ciclo de vida de current-state do módulo
- `archive/`: documentos antigos de plan e current-state do módulo
- `adr/README.md`: regras de decisão do módulo
- `adr/template.md`: modelo oficial de ADR do módulo
- `adr/0001-title.md`: primeira decisão relevante do módulo
- `adr/current-state.md`: snapshot da camada de decisão do módulo
- `adr/archive/`: decisões antigas do módulo

## Uso prático

- Use `docs/reading-paths.md` para escolher o conjunto mínimo de documentos por perfil.
- Use `docs/modules/<modulo>/reading-paths.md` quando a tarefa estiver restrita a um módulo específico.
- Para qualquer alteração em um módulo, leia primeiro o `README.md` do próprio módulo e depois os arquivos indicados pelo reading path.
- Use `docs/modules/new-module-process.md` quando estiver criando ou ampliando um módulo novo com base em escopo e stack.
