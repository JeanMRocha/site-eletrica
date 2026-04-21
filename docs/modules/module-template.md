# Modelo de Novo Módulo

> Status: stable
> Type: template
> Last updated: 2026-04-21
> Owner: repository

Template base para iniciar um módulo novo com a documentação mínima já alinhada ao processo do repositório.

## Como usar

- Duplique este template para a nova pasta do módulo.
- Troque os nomes e descrições de acordo com o escopo real.
- Complete os arquivos mínimos antes de começar a implementação.

## Estrutura mínima esperada

- `README.md`
- `reading-paths.md`
- `rules.md`
- `contracts.md`
- `security.md`
- `tests.md`
- `current-state.md`
- `active-plan.md`
- `changelog.md`
- `onboarding.md`

## Cabeçalho do módulo

```md
# <Nome do Módulo>

> Status: draft | stable
> Type: module
> Last updated: AAAA-MM-DD
> Owner: <owner>

<Descrição curta do que o módulo faz e por que ele existe.>
```

## Seções recomendadas do `README.md`

### Escopo

- <o que o módulo cobre>

### Documentos do módulo

- `rules.md`: <descrição>
- `contracts.md`: <descrição>
- `security.md`: <descrição>
- `tests.md`: <descrição>
- `reading-paths.md`: <descrição>
- `onboarding.md`: <descrição>
- `active-plan.md`: <descrição>
- `current-state.md`: <descrição>
- `changelog.md`: <descrição>

### Navegação mínima

- `docs/governance.md`
- `docs/modules/<modulo>/onboarding.md`
- `docs/modules/<modulo>/reading-paths.md`
- `docs/modules/<modulo>/current-state.md`

## Seções recomendadas do `reading-paths.md`

### Leitura inicial

1. `docs/governance.md`
2. `docs/product-overview.md`
3. `docs/architecture.md`
4. `docs/stack.md`
5. `docs/development-principles.md`
6. `docs/agent-rules.md`

### Mapa rápido

| Tipo de mudança | Leitura mínima | Leitura opcional | Evitar por padrão |
| --- | --- | --- | --- |
| Nova regra do módulo | `README.md`, `rules.md`, `contracts.md`, `tests.md` | `security.md`, `onboarding.md`, `current-state.md` | Módulos não relacionados |
| Mudança de contrato | `README.md`, `contracts.md`, `tests.md` | `rules.md`, `current-state.md`, `security.md` | ADRs fora do módulo sem necessidade |
| Mudança de segurança | `README.md`, `security.md`, `tests.md` | `contracts.md`, `onboarding.md`, `current-state.md` | Docs de outros módulos |
| Mudança de estado | `current-state.md`, `changelog.md`, `active-plan.md` | `README.md`, `onboarding.md` | ADRs antigos sem relação direta |

## Seções recomendadas do `contracts.md`

- Principais endpoints, eventos ou interfaces
- Modelos de request e response
- Códigos de status e erros esperados
- Regras de versionamento e compatibilidade
- Exemplos reais de payload quando aplicável

## Seções recomendadas do `security.md`

- Controles mínimos
- Riscos a considerar
- Exigências de revisão
- Regras de auditoria e abuso

## Seções recomendadas do `tests.md`

- Regra geral
- Testes mínimos
- Gates do módulo
- Observações

## Seções recomendadas do `current-state.md`

- Current state
- Invariants
- Operational notes
- Update rule
- Review criteria

## Seções recomendadas do `onboarding.md`

- O que o módulo cobre
- Ordem de leitura recomendada
- Estado vivo versus snapshot
- O que olhar primeiro
- Regra prática

## Seções recomendadas do `adr/README.md`

- Quando usar
- Ciclo de vida
- Critério para criar ADR
- Estrutura
- Leitura
- Regra de uso prático
