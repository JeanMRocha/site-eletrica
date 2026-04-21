# Fase 1

> Status: active
> Type: plan
> Last updated: 2026-04-21
> Owner: repository

Plano de implementação da primeira fase do produto, focado no mínimo necessário para começar com segurança e visibilidade.

## Objetivo

- Entregar a base funcional da aplicação web.
- Cobrir autenticação, cadastro de estudos, modelagem eletrica inicial, primeiro fluxo de cálculo, conformidade e persistência.
- Evitar regras espalhadas na UI antes de ter a base técnica confiável.

## Escopo

### `auth`

- Login seguro.
- Sessão e autorização.
- Auditoria de acesso.
- Base para controle de permissões.

#### Tarefas

- Definir modelo de sessão e perfis de acesso.
- Fechar contratos de login, refresh, logout e revogação.
- Criar testes de login válido, login inválido e revogação.
- Garantir logging de eventos de acesso e falha.
- Preparar o onboarding do módulo para a primeira implementação.

### `projects`

- Cadastro de estudos elétricos.
- Identificação do cliente ou contexto técnico.
- Organização das entradas do estudo.
- Relação entre estudo e execuções de cálculo.

#### Tarefas

- Definir modelo de estudo.
- Criar o contrato de criação e consulta.
- Persistir dados básicos do estudo.
- Criar testes de criação, leitura e atualização básica.

### `ambientes`

- Cadastro de ambientes e areas.
- Tipo de uso, dimensoes e observacoes de projeto.

#### Tarefas

- Definir o modelo de ambiente.
- Criar o contrato de criação e consulta.
- Persistir dados basicos do ambiente.

### `cargas`

- Entrada e classificacao de cargas.
- Iluminacao, TUG, TUE e cargas especificas.
- Base para demanda e agrupamento.

#### Tarefas

- Definir o modelo de carga.
- Criar o contrato de entrada e consulta.
- Persistir cargas associadas ao estudo.

### `circuitos`

- Segmentacao inicial dos circuitos.
- Agrupamento logico por ambiente e tipo de uso.

#### Tarefas

- Definir o modelo de circuito.
- Criar o contrato de composicao e consulta.
- Persistir circuitos gerados ou sugeridos.

### `condutores`

- Dimensionamento inicial de condutores.
- Seção, metodo de instalacao, agrupamento e queda de tensao.

#### Tarefas

- Definir o modelo de condutor.
- Criar o contrato de entrada e resultado.
- Persistir a solucao sugerida.

### `protecao`

- Disjuntores, DR, DPS e verificacoes basicas.
- Compatibilidade entre corrente de projeto e protecao.

#### Tarefas

- Definir o modelo de protecao.
- Criar o contrato de selecao e validacao.
- Persistir a protecao escolhida.

### `standards`

- Catálogo de normas e critérios técnicos.
- Versão da regra aplicada ao estudo.

#### Tarefas

- Definir o modelo de norma e versão.
- Criar o contrato de consulta e seleção da norma aplicada.
- Persistir a referência normativa usada no estudo.

### `conformidade`

- Validação normativa, legal e técnica da solucao calculada.
- Resposta sobre conformidade, nao conformidade, incompletude e revisao humana.

#### Tarefas

- Definir o modelo de fonte e regra computavel.
- Criar o contrato de validacao e retorno de severidade.
- Persistir o veredito, a regra aplicada e a justificativa.
- Criar testes por regra e por cenario.

### `calculations`

- Primeiro fluxo de dimensionamento elétrico.
- Entradas técnicas explícitas.
- Regras de cálculo no backend.
- Histórico de execuções e resultados.

#### Tarefas

- Definir o primeiro caso de cálculo da aplicação.
- Criar o modelo de entrada e saída.
- Implementar o serviço de cálculo.
- Persistir resultados e parâmetros usados.
- Criar testes para entradas válidas, inválidas e resultados esperados.
- Registrar a norma aplicada e as referências correlatas.

### `reports`

- Saida tecnica resumida e rastreavel.
- Memorial, lista de materiais e pendencias.

#### Tarefas

- Definir a primeira estrutura de relatorio.
- Criar o contrato de consolidacao dos dados.
- Persistir a versao gerada do relatorio.

### `web`

- Formulários de entrada.
- Visualização de resultados.
- Navegação simples entre estudos e cálculos.

#### Tarefas

- Desenhar a primeira jornada web.
- Exibir estudo e resultado de cálculo.
- Garantir que a UI apenas consuma contratos da API.

## Fora de escopo

- Sugestão avançada de rotas.
- Estimativas detalhadas de materiais, mão de obra, equipamentos e tempo.
- Exportações avançadas.
- Regras técnicas para múltiplos tipos de sistemas ao mesmo tempo.
- Fluxos de aprovação múltipla para todas as ações.
- Automação que esconda o cálculo do usuário.
- Implementação completa de `knowledge` e `core` antes de o nucleo ficar validado.

## Dependências

- `docs/mvp.md`
- `docs/product-overview.md`
- `docs/architecture.md`
- `docs/stack.md`
- `docs/modules/new-module-process.md`
- `docs/modules/module-template.md`
- `docs/modules/auth/*`
- `docs/modules/projects/*`
- `docs/modules/ambientes/*`
- `docs/modules/cargas/*`
- `docs/modules/circuitos/*`
- `docs/modules/condutores/*`
- `docs/modules/protecao/*`
- `docs/modules/standards/*`
- `docs/modules/conformidade/*`
- `docs/modules/calculations/*`
- `docs/modules/reports/*`

## Ordem de implementação

1. `auth`
2. `projects`
3. `ambientes`
4. `cargas`
5. `circuitos`
6. `condutores`
7. `protecao`
8. `standards`
9. `calculations`
10. `conformidade`
11. `reports`
12. `web`

## Tarefas por etapa

### 1. `auth`

- Criar o esqueleto do módulo.
- Escrever testes de fluxo e autorização.
- Implementar login, sessão e revogação.

### 2. `projects`

- Criar cadastro e persistência.
- Expor o estado do estudo para consumo da API e da UI.

### 3. `ambientes`

- Criar cadastro e persistência.
- Expor o estado do ambiente para consumo da API e da UI.

### 4. `cargas`

- Criar cadastro e persistência.
- Expor a carga e sua classificacao.

### 5. `circuitos`

- Criar a segmentacao inicial.
- Persistir a sugestao gerada.

### 6. `condutores`

- Criar o primeiro calculo de seção.
- Persistir parametros e resultado.

### 7. `protecao`

- Criar a escolha inicial da protecao.
- Persistir a sugestao e seus motivos.

### 8. `standards`

- Criar o catálogo inicial de normas e critérios.
- Persistir a norma aplicada ao estudo.

### 9. `calculations`

- Criar o primeiro cálculo dimensionado.
- Persistir parâmetros, resultado e histórico.
- Garantir que o serviço seja testável de forma isolada.

### 10. `conformidade`

- Criar o primeiro validador de regra computavel.
- Persistir o veredito e a justificativa.

### 11. `reports`

- Consolidar o resumo tecnico.
- Persistir a versao do relatorio.

### 12. `web`

- Montar a primeira visão da aplicação.
- Exibir os principais dados e resultados.
- Ajustar navegação para uso diário.

## Critérios de conclusão

- É possível entrar na aplicação com autenticação segura.
- É possível criar e consultar um estudo elétrico.
- É possível cadastrar ambientes, cargas e circuitos base.
- É possível registrar a norma aplicada.
- É possível executar e revisar pelo menos um cálculo persistido.
- É possível receber um veredito de conformidade para o resultado calculado.
- É possível visualizar o resultado em um painel web.
- As regras críticas continuam no backend e não na UI.
- Cada módulo da fase 1 tem docs mínimos, testes e critérios claros antes de ampliar o escopo.

## Regra prática

- Se um item não ajuda a provar que o sistema calcula, persiste ou apresenta o resultado técnico, ele fica fora da fase 1.
- Se uma automação puder aumentar o risco de erro técnico, ela fica para a próxima fase.
