# Mapas de leitura

> Status: stable
> Type: guide
> Last updated: 2026-04-20
> Owner: repository

Guia prático para decidir quais documentos ler por perfil, sem carregar a documentação inteira por padrão.

## Regra geral

- Leia primeiro `docs/governance.md`.
- Depois leia apenas os documentos do perfil ou do módulo afetado.
- Não carregue módulos ou ADRs fora do escopo da mudança.
- Se a mudança tocar `auth`, use o caminho de `auth` abaixo.

## 1. Novo contribuidor

Leia nesta ordem:

1. `docs/governance.md`
2. `docs/product-overview.md`
3. `docs/architecture.md`
4. `docs/stack.md`
5. `docs/development-principles.md`
6. `docs/agent-rules.md`
7. `docs/README.md`
8. `docs/modules/README.md`
9. `docs/current-state.md`
10. `docs/roadmap.md`

Use documentos de módulo apenas quando a tarefa apontar para uma área específica.

## 2. Dev mexendo em auth

Leia nesta ordem:

1. `docs/governance.md`
2. `docs/product-overview.md`
3. `docs/architecture.md`
4. `docs/agent-rules.md`
5. `docs/modules/README.md`
6. `docs/modules/auth/README.md`
7. `docs/modules/auth/rules.md`
8. `docs/modules/auth/contracts.md`
9. `docs/modules/auth/security.md`
10. `docs/modules/auth/tests.md`
11. `docs/modules/auth/runbook.md`
12. `docs/modules/auth/current-state.md`
13. `docs/modules/auth/active-plan.md`
14. `docs/modules/auth/adr/README.md`

Se a alteração criar comportamento novo, atualize ou crie os testes antes da implementação.

## 3. Operador

Leia nesta ordem:

1. `docs/governance.md`
2. `docs/product-overview.md`
3. `docs/current-state.md`
4. `docs/modules/auth/runbook.md` quando o incidente ou a operação envolver auth
5. `docs/modules/auth/current-state.md` quando o problema estiver no módulo auth
6. `docs/changelog.md` quando precisar verificar o histórico recente

Use ADR apenas quando a operação exigir entender uma decisão histórica.

## 4. Revisor de arquitetura

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
10. `docs/modules/README.md`
11. `docs/modules/auth/README.md` quando auth estiver em análise
12. `docs/modules/auth/adr/README.md` quando auth estiver em análise

Concentre-se em decisões, fronteiras, riscos e trade-offs.

## Resumo rápido

- Novo contribuidor: visão geral primeiro, depois módulo conforme o trabalho.
- Auth: documentação local do módulo + segurança + testes + runbook.
- Operador: estado vigente + runbook + histórico recente.
- Arquitetura: arquitetura + stack + ADR + roadmap.
