# Processo de Novo Módulo

> Status: stable
> Type: guide
> Last updated: 2026-04-20
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
- Quando o módulo tocar operação remota, trate SSH como canal padrão de controle e mantenha provider APIs como adapters opcionais.

### 3. Criar a documentação primeiro

Crie o conjunto mínimo de documentação antes da implementação:

- `module-template.md`
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
- `adr/README.md`
- `adr/current-state.md`

Se o módulo precisar de controle remoto, inclua também a descrição do canal padrão e dos adapters alternativos esperados.

### 4. Adicionar decisões apenas quando necessário

- Crie ADR apenas para decisões duradouras.
- Use `current-state.md` para o que vale agora.
- Use `changelog.md` para evolução incremental.
- Use `active-plan.md` para execução em andamento.

### 5. Implementar a partir dos docs

- Escreva testes antes da implementação quando houver comportamento novo.
- Implemente somente depois que os contratos, regras e segurança estiverem claros.
- Atualize os docs quando a implementação revelar uma regra real que ainda não estava registrada.

### 6. Fechar o incremento do módulo

- Rode os testes do módulo.
- Rode a suíte completa antes de commit ou PR.
- Atualize `current-state.md`, `changelog.md` e `active-plan.md` quando necessário.
- Atualize ou crie ADR apenas se uma decisão nova for realmente duradoura.

## Formato mínimo do módulo

Todo módulo novo deve, no mínimo, ter:

- um README de entrada
- leitura mínima por escopo
- contratos explícitos
- segurança documentada
- estratégia de testes
- estado vivo
- histórico incremental
- onboarding quando o módulo começar a crescer
- ADR apenas quando houver decisão relevante

## Regra prática

- Se o módulo ainda não tem docs mínimos, ele ainda não está pronto para implementação ampla.
- Se o escopo mudar, atualize primeiro a documentação, depois a implementação.
- Use `docs/modules/module-template.md` como base inicial quando for criar a primeira versão do módulo.
