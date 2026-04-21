# Mapas de leitura

> Status: stable
> Type: guide
> Last updated: 2026-04-21
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
| Dev de auth | `docs/governance.md`, `docs/modules/auth/README.md`, `docs/modules/auth/rules.md`, `docs/modules/auth/contracts.md`, `docs/modules/auth/security.md`, `docs/modules/auth/tests.md`, `docs/modules/auth/current-state.md` | `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/auth/onboarding.md`, `docs/modules/auth/active-plan.md`, `docs/modules/auth/adr/README.md` | Outros módulos, ADRs fora de auth, docs globais sem relação direta |
| Dev de projetos | `docs/governance.md`, `docs/modules/projects/README.md`, `docs/modules/projects/rules.md`, `docs/modules/projects/contracts.md`, `docs/modules/projects/tests.md`, `docs/modules/projects/current-state.md` | `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/projects/onboarding.md`, `docs/modules/projects/active-plan.md` | Outros módulos e ADRs não relacionados |
| Dev de normas | `docs/governance.md`, `docs/modules/standards/README.md`, `docs/modules/standards/rules.md`, `docs/modules/standards/contracts.md`, `docs/modules/standards/tests.md`, `docs/modules/standards/current-state.md` | `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/standards/onboarding.md`, `docs/modules/standards/active-plan.md` | Outros módulos e ADRs não relacionados |
| Dev de cálculos | `docs/governance.md`, `docs/modules/calculations/README.md`, `docs/modules/calculations/rules.md`, `docs/modules/calculations/contracts.md`, `docs/modules/calculations/tests.md`, `docs/modules/calculations/current-state.md` | `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/calculations/onboarding.md`, `docs/modules/calculations/active-plan.md` | Outros módulos e ADRs não relacionados |
| Dev de conformidade | `docs/governance.md`, `docs/modules/conformidade/README.md`, `docs/modules/conformidade/rules.md`, `docs/modules/conformidade/contracts.md`, `docs/modules/conformidade/tests.md`, `docs/modules/conformidade/current-state.md` | `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/conformidade/onboarding.md`, `docs/modules/conformidade/active-plan.md` | Outros módulos e ADRs não relacionados |
| Dev de estimativas | `docs/governance.md`, `docs/modules/estimations/README.md`, `docs/modules/estimations/rules.md`, `docs/modules/estimations/contracts.md`, `docs/modules/estimations/tests.md`, `docs/modules/estimations/current-state.md` | `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/estimations/onboarding.md`, `docs/modules/estimations/active-plan.md` | Outros módulos e ADRs não relacionados |
| Dev de rotas | `docs/governance.md`, `docs/modules/routing/README.md`, `docs/modules/routing/rules.md`, `docs/modules/routing/contracts.md`, `docs/modules/routing/tests.md`, `docs/modules/routing/current-state.md` | `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/routing/onboarding.md`, `docs/modules/routing/active-plan.md` | Outros módulos e ADRs não relacionados |
| Dev de conhecimento | `docs/governance.md`, `docs/modules/knowledge/README.md`, `docs/modules/knowledge/rules.md`, `docs/modules/knowledge/contracts.md`, `docs/modules/knowledge/tests.md`, `docs/modules/knowledge/current-state.md` | `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/knowledge/onboarding.md`, `docs/modules/knowledge/active-plan.md` | Outros módulos e ADRs não relacionados |
| Dev de core | `docs/governance.md`, `docs/modules/core/README.md`, `docs/modules/core/rules.md`, `docs/modules/core/contracts.md`, `docs/modules/core/tests.md`, `docs/modules/core/current-state.md` | `docs/product-overview.md`, `docs/architecture.md`, `docs/modules/core/onboarding.md`, `docs/modules/core/active-plan.md` | Outros módulos e ADRs não relacionados |
| Revisor de arquitetura | `docs/governance.md`, `docs/product-overview.md`, `docs/architecture.md`, `docs/stack.md`, `docs/development-principles.md`, `docs/adr/README.md`, `docs/current-state.md` | `docs/modules/README.md`, `docs/modules/auth/README.md`, `docs/modules/projects/README.md`, `docs/modules/standards/README.md`, `docs/modules/calculations/README.md`, `docs/roadmap.md` | Runbooks e planos operacionais quando a revisão for só estrutural |

## Como usar

- Se o trabalho for novo para o colaborador, use o caminho de `Novo contribuidor`.
- Se o trabalho tocar `auth`, use o caminho de `Dev de auth`.
- Se o trabalho tocar fluxo de estudo, use o caminho de `Dev de projetos`.
- Se o trabalho tocar norma técnica, use o caminho de `Dev de normas`.
- Se o trabalho tocar cálculo, use o caminho de `Dev de cálculos`.
- Se o trabalho tocar conformidade, use o caminho de `Dev de conformidade`.
- Se o trabalho tocar custo e composição, use o caminho de `Dev de estimativas`.
- Se o trabalho tocar alternativas de instalação, use o caminho de `Dev de rotas`.
- Se o trabalho tocar explicações, glossário ou orientação do usuário, use o caminho de `Dev de conhecimento`.
- Se o trabalho tocar contratos compartilhados, unidades, fórmulas ou auditoria, use o caminho de `Dev de core`.
- Se o trabalho for revisão de fronteiras ou trade-offs, use o caminho de `Revisor de arquitetura`.
- Se nada disso se aplicar, leia apenas o mínimo necessário definido pela governança.

## Resumo rápido

- Novo contribuidor: visão geral primeiro.
- Auth: docs locais do módulo + segurança + testes.
- Projetos: dados do estudo + persistência + contrato.
- Normas: versão e aplicabilidade da regra.
- Cálculos: regras + contrato + testes.
- Conformidade: veredito, severidade e justificativa.
- Estimativas: composição de custos e recursos.
- Rotas: alternativas de instalação.
- Conhecimento: explicações e limites do sistema.
- Core: contratos e primitivas compartilhadas.
- Arquitetura: arquitetura + stack + ADR + roadmap.
