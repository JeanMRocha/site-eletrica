# Histórico de Mudanças

> Status: active
> Type: history
> Last updated: 2026-04-20
> Owner: repository

Registro cronológico das mudanças relevantes no repositório.

## Formato sugerido

- Data: `AAAA-MM-DD`
- Mudança: descrição objetiva do que foi alterado
- Motivo: por que a mudança foi feita
- Impacto: efeito prático para a base, a API ou a UI
- Arquivos: principais arquivos afetados

## Modelo de entrada

```md
### AAAA-MM-DD

- Mudança: ...
- Motivo: ...
- Impacto: ...
- Arquivos: `arquivo-1`, `arquivo-2`
```

## Entradas

### 2026-04-20

- Mudança: formalizada a política de ciclo de vida de ADR com `current-state`, `archive` e critérios objetivos de criação.
- Motivo: evitar crescimento desnecessário de ADRs e manter decisões realmente úteis e rastreáveis.
- Impacto: decisões antigas passam a ter caminho de arquivamento e o estado vigente ganha resumo próprio.
- Arquivos: `docs/adr/README.md`, `docs/adr/current-state.md`, `docs/adr/archive/README.md`, `docs/modules/README.md`, `docs/modules/auth/adr/README.md`, `docs/modules/auth/adr/current-state.md`, `docs/modules/auth/adr/archive/README.md`, `docs/README.md`, `docs/agent-rules.md`, `docs/header-template.md`

### 2026-04-20

- Mudança: implantada a governança de documentação por escopo, com ADRs globais e por módulo, além da política de testes por escopo.
- Motivo: permitir que o agente leia apenas o contexto necessário e manter decisões arquiteturais rastreáveis.
- Impacto: a documentação agora separa leitura global, leitura por módulo, decisões arquiteturais e testes por escopo.
- Arquivos: `docs/README.md`, `docs/adr/README.md`, `docs/adr/0001-documentation-topology.md`, `docs/adr/0002-scope-based-testing.md`, `docs/modules/README.md`, `docs/modules/auth/adr/*`, `docs/agent-rules.md`, `docs/development-principles.md`, `AGENTS.md`, `.agent`

### 2026-04-20

- Mudança: criado o arquivo `docs/agent-rules.md` com regras de idioma e consistência do agente.
- Motivo: explicitar convenções de trabalho para evitar ambiguidade entre UI, código e documentação.
- Impacto: o agente passa a ter uma referência direta para manter UI em `pt-BR` e código em inglês internacional.
- Arquivos: `docs/agent-rules.md`

### 2026-04-20

- Mudança: criados os documentos `docs/changelog.md`, `docs/active-plan.md` e `docs/roadmap.md`.
- Motivo: separar histórico, execução atual e visão de longo prazo em arquivos distintos.
- Impacto: a documentação passa a ter um lugar claro para registrar mudanças, ações em andamento e pendências futuras.
- Arquivos: `docs/changelog.md`, `docs/active-plan.md`, `docs/roadmap.md`
