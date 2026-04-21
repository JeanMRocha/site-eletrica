# Mapas de leitura

> Status: stable
> Type: guide
> Last updated: 2026-04-20
> Owner: repository

Guia prático derivado de `docs/governance.md` para decidir quais documentos ler por perfil, sem carregar a documentação inteira por padrão.

## Regra geral

- Leia primeiro `docs/governance.md`.
- Depois leia apenas os documentos do perfil ou do módulo afetado.
- Não carregue módulos ou ADRs fora do escopo da mudança.
- Se a mudança tocar `auth`, use o caminho de `auth` abaixo.
- Se houver conflito com `docs/governance.md`, a governança vence.

## Mapa rápido

| Perfil | Leitura mínima | Leitura opcional | Não ler por padrão |
| --- | --- | --- | --- |
| Novo contribuidor | `docs/governance.md`, `docs/product-overview.md`, `docs/architecture.md`, `docs/stack.md`, `docs/development-principles.md` | `docs/README.md`, `docs/modules/README.md`, `docs/current-state.md`, `docs/roadmap.md` | ADRs, módulos não relacionados, snapshots antigos |
| Dev de auth | `docs/governance.md`, `docs/modules/auth/README.md`, `docs/modules/auth/rules.md`, `docs/modules/auth/contracts.md`, `docs/modules/auth/security.md`, `docs/modules/auth/tests.md`, `docs/modules/auth/current-state.md` | `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/auth/runbook.md`, `docs/modules/auth/active-plan.md`, `docs/modules/auth/adr/README.md` | Outros módulos, ADRs fora de auth, docs globais sem relação direta |
| Operador | `docs/governance.md`, `docs/product-overview.md`, `docs/current-state.md`, `docs/changelog.md` | `docs/modules/auth/runbook.md`, `docs/modules/auth/current-state.md` quando auth estiver envolvido | ADRs extensos, arquitetura profunda, módulos não afetados |
| Revisor de arquitetura | `docs/governance.md`, `docs/product-overview.md`, `docs/architecture.md`, `docs/stack.md`, `docs/development-principles.md`, `docs/adr/README.md`, `docs/current-state.md` | `docs/modules/README.md`, `docs/modules/auth/README.md`, `docs/modules/auth/adr/README.md`, `docs/roadmap.md` | Runbooks e planos operacionais quando a revisão for só estrutural |

## Como usar

- Se o trabalho for novo para o colaborador, use o caminho de `Novo contribuidor`.
- Se o trabalho tocar `auth`, use o caminho de `Dev de auth`.
- Se o trabalho for operacional, use o caminho de `Operador`.
- Se o trabalho for revisão de fronteiras ou trade-offs, use o caminho de `Revisor de arquitetura`.
- Se nada disso se aplicar, leia apenas o mínimo necessário definido pela governança.

## Caminhos detalhados

### Novo contribuidor

Leia nesta ordem:

1. `docs/governance.md`
2. `docs/product-overview.md`
3. `docs/architecture.md`
4. `docs/stack.md`
5. `docs/development-principles.md`

Use os demais documentos apenas quando a tarefa apontar para um escopo específico.

### Dev mexendo em auth

Leia nesta ordem:

1. `docs/governance.md`
2. `docs/product-overview.md`
3. `docs/architecture.md`
4. `docs/modules/auth/README.md`
5. `docs/modules/auth/rules.md`
6. `docs/modules/auth/contracts.md`
7. `docs/modules/auth/security.md`
8. `docs/modules/auth/tests.md`
9. `docs/modules/auth/current-state.md`

Use `runbook.md`, `active-plan.md` e `adr/README.md` quando a tarefa exigir contexto de operação, execução ou decisão.

Se a alteração criar comportamento novo, atualize ou crie os testes antes da implementação.

### Operador

Leia nesta ordem:

1. `docs/governance.md`
2. `docs/product-overview.md`
3. `docs/current-state.md`
4. `docs/changelog.md`

Se a operação envolver auth, leia também `docs/modules/auth/runbook.md` e `docs/modules/auth/current-state.md`.

### Revisor de arquitetura

Leia nesta ordem:

1. `docs/governance.md`
2. `docs/product-overview.md`
3. `docs/architecture.md`
4. `docs/stack.md`
5. `docs/development-principles.md`
6. `docs/adr/README.md`
7. `docs/adr/current-state.md`
8. `docs/current-state.md`
9. `docs/roadmap.md`

Se a revisão tocar um módulo, abra também `docs/modules/README.md` e o `README.md` do módulo afetado.

## Resumo rápido

- Novo contribuidor: visão geral primeiro.
- Auth: docs locais do módulo + segurança + testes + runbook.
- Operador: estado vigente + histórico recente.
- Arquitetura: arquitetura + stack + ADR + roadmap.
