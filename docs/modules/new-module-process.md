# Processo de Novo Módulo

> Status: stable
> Type: guide
> Last updated: 2026-04-21
> Owner: repository

Processo oficial para criar e evoluir um novo módulo com base em escopo e stack.

## Leitura inicial

Antes de criar um módulo novo, leia nesta ordem:

1. `docs/governance.md`
2. `docs/product-overview.md`
3. `docs/architecture.md`
4. `docs/stack.md`
5. `docs/development-principles.md`
6. `docs/agent-rules.md`

## Quando criar um módulo

- Crie um módulo quando houver uma área funcional distinta com regras, contratos, testes e estado próprios.
- Crie um módulo quando a área exigir leitura, operação ou decisão separada do restante do sistema.
- Não crie módulo para um detalhe isolado que ainda não tenha escopo estável.

## Fluxo de evolução

### 1. Definir escopo

- Identifique o problema do produto que o módulo resolve.
- Confirme se o escopo cabe nas áreas já existentes ou se precisa de um novo módulo.
- Registre a fronteira do módulo em linguagem clara e objetiva.

### 2. Validar aderência à stack

- Valide se a solução respeita `Go` na API, `vinext` como camada de experiência e `PostgreSQL` como persistência.
- Confirme se a solução mantém portabilidade e evita dependência de provedor.
- Confirme se o módulo pode ser implementado com componentes pequenos, explícitos e testáveis.

### 3. Estruturar a documentação

- Crie a pasta do módulo.
- Copie `docs/modules/module-template.md`.
- Preencha `README.md`, `reading-paths.md`, `rules.md`, `contracts.md`, `security.md`, `tests.md`, `current-state.md`, `active-plan.md`, `onboarding.md` e `changelog.md` quando aplicável.
- Se houver decisão duradoura, crie ADR do módulo.

### 4. Implementar por fatias

- Comece pelo contrato.
- Depois implemente a regra de domínio.
- Em seguida ligue a persistência.
- Por fim, conecte a UI ou a integração externa.

## Critérios de saída do processo

- O módulo tem escopo claro.
- O módulo tem leitura mínima definida.
- O módulo tem contrato e testes previstos.
- O módulo tem regra de decisão clara para mudanças duradouras.

## Regra prática

- Se a mudança ainda não puder ser lida como um módulo, ela não deve virar pasta própria.
- Se o módulo começar a crescer em complexidade, atualize o onboarding e o reading path antes de ampliar o código.
