# Fase 1

> Status: active
> Type: plan
> Last updated: 2026-04-21
> Owner: repository

Plano de implementação da primeira fase do produto, focado no mínimo necessário para começar com segurança e visibilidade.

## Objetivo

- Entregar a base funcional da aplicação web.
- Cobrir autenticação, cadastro de projetos, primeiro fluxo de cálculo e persistência.
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

- Cadastro de projetos elétricos.
- Identificação do cliente ou contexto técnico.
- Organização das entradas do estudo.
- Relação entre projeto e execuções de cálculo.

#### Tarefas

- Definir modelo de projeto.
- Criar o contrato de criação e consulta.
- Persistir dados básicos do projeto.
- Criar testes de criação, leitura e atualização básica.

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

### `web`

- Formulários de entrada.
- Visualização de resultados.
- Navegação simples entre projetos e cálculos.

#### Tarefas

- Desenhar a primeira jornada web.
- Exibir projeto e resultado de cálculo.
- Garantir que a UI apenas consuma contratos da API.

## Fora de escopo

- Exportações avançadas.
- Catálogos complexos.
- Regras técnicas para múltiplos tipos de sistemas ao mesmo tempo.
- Fluxos de aprovação múltipla para todas as ações.
- Automação que esconda o cálculo do usuário.

## Dependências

- `docs/mvp.md`
- `docs/product-overview.md`
- `docs/architecture.md`
- `docs/stack.md`
- `docs/modules/new-module-process.md`
- `docs/modules/module-template.md`
- `docs/modules/auth/*`
- `docs/modules/projects/*`
- `docs/modules/calculations/*`

## Ordem de implementação

1. `auth`
2. `projects`
3. `calculations`
4. `web`

## Tarefas por etapa

### 1. `auth`

- Criar o esqueleto do módulo.
- Escrever testes de fluxo e autorização.
- Implementar login, sessão e revogação.

### 2. `projects`

- Criar cadastro e persistência.
- Expor o estado do projeto para consumo da API e da UI.

### 3. `calculations`

- Criar o primeiro cálculo dimensionado.
- Persistir parâmetros, resultado e histórico.
- Garantir que o serviço seja testável de forma isolada.

### 4. `web`

- Montar a primeira visão da aplicação.
- Exibir os principais dados e resultados.
- Ajustar navegação para uso diário.

## Critérios de conclusão

- É possível entrar na aplicação com autenticação segura.
- É possível criar e consultar um projeto elétrico.
- É possível executar e revisar pelo menos um cálculo persistido.
- É possível visualizar o resultado em um painel web.
- As regras críticas continuam no backend e não na UI.
- Cada módulo da fase 1 tem docs mínimos, testes e critérios claros antes de ampliar o escopo.

## Regra prática

- Se um item não ajuda a provar que o sistema calcula, persiste ou apresenta o resultado técnico, ele fica fora da fase 1.
- Se uma automação puder aumentar o risco de erro técnico, ela fica para a próxima fase.
