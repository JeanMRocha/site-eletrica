# Fase 1

> Status: active
> Type: plan
> Last updated: 2026-04-21
> Owner: repository

Plano de implementação da primeira fase do produto, focado no mínimo necessário para começar com segurança e visibilidade.

## Objetivo

- Entregar a base funcional do control plane.
- Cobrir inventário, autenticação, monitoramento básico, incidentes e painel central.
- Evitar automação excessiva antes de ter visibilidade confiável.

## Escopo

### `auth`

- Login seguro.
- Sessão e autorização.
- Auditoria de acesso.
- Base para controle de permissões.

#### Tarefas

- Definir modelo de sessão e papéis de operador.
- Fechar contratos de login, refresh, logout e revogação.
- Criar testes de login válido, login inválido e revogação.
- Garantir logging de eventos de acesso e falha.
- Preparar o onboarding do módulo para a primeira implementação.

### `nodes`

- Cadastro das VPS e seus papéis.
- Estado de saúde básico.
- Heartbeats e coleta inicial de métricas.
- Relação entre a VPS principal, a VPS Oracle e a VPS local.

#### Tarefas

- Definir inventário inicial das três VPS.
- Criar o modelo de dados para nós e papéis.
- Desenhar o contrato de heartbeat.
- Persistir estado básico de saúde e última comunicação.
- Criar testes para ausência de heartbeat e nó indisponível.

### `incidents`

- Registro de degradação e falhas.
- Severidade.
- Linha do tempo do incidente.
- Histórico de resolução.

#### Tarefas

- Definir estrutura de incidente, severidade e status.
- Criar o fluxo de abertura de incidente a partir de falha ou degradação.
- Registrar linha do tempo e resolução.
- Ligar incidente ao nó afetado e ao evento que o originou.
- Criar testes para abertura, atualização e encerramento de incidente.

### `dashboard`

- Visão consolidada do estado dos ambientes.
- Alertas e incidentes recentes.
- Estado de saúde resumido.
- Acesso rápido aos detalhes operacionais.

#### Tarefas

- Desenhar a visão de resumo da infraestrutura.
- Exibir o estado consolidado das três VPS.
- Exibir alertas e incidentes recentes.
- Exibir caminhos rápidos para detalhes de nós e incidentes.
- Garantir que a UI apenas consuma contratos da API.

## Fora de escopo

- Remediação automática complexa.
- Migração automática entre provedores.
- Observabilidade avançada completa.
- Orquestração própria de larga escala.
- Fluxos de aprovação múltipla para todas as ações.

## Dependências

- `docs/mvp.md`
- `docs/product-overview.md`
- `docs/architecture.md`
- `docs/stack.md`
- `docs/modules/new-module-process.md`
- `docs/modules/module-template.md`
- `docs/modules/auth/*`

## Ordem de implementação

1. `auth`
2. `nodes`
3. `incidents`
4. `dashboard`

## Tarefas por etapa

### 1. `auth`

- Criar o esqueleto do módulo.
- Escrever testes de fluxo e autorização.
- Implementar login, sessão e revogação.
- Conectar auditoria básica.

### 2. `nodes`

- Criar inventário e persistência.
- Implementar heartbeat e health básico.
- Expor o estado dos nós para consumo da API e da UI.

### 3. `incidents`

- Criar modelo de incidente.
- Gerar e atualizar incidentes a partir de estados degradados.
- Preservar histórico e severidade.

### 4. `dashboard`

- Montar a visão consolidada.
- Exibir os principais estados e alertas.
- Ajustar navegação para operação diária.

## Critérios de conclusão

- É possível entrar no painel com autenticação segura.
- É possível ver as máquinas monitoradas e seus estados básicos.
- É possível registrar e acompanhar incidentes.
- É possível visualizar o estado consolidado em um painel central.
- As regras críticas continuam na API e não na UI.
- Cada módulo da fase 1 tem docs mínimos, testes e critérios claros antes de ampliar o escopo.

## Regra prática

- Se um item não ajuda a provar que o sistema vê, entende ou protege as VPS, ele fica fora da fase 1.
- Se uma automação puder aumentar o risco mais do que o benefício, ela fica para a próxima fase.
