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

### `nodes`

- Cadastro das VPS e seus papéis.
- Estado de saúde básico.
- Heartbeats e coleta inicial de métricas.
- Relação entre a VPS principal, a VPS Oracle e a VPS local.

### `incidents`

- Registro de degradação e falhas.
- Severidade.
- Linha do tempo do incidente.
- Histórico de resolução.

### `dashboard`

- Visão consolidada do estado dos ambientes.
- Alertas e incidentes recentes.
- Estado de saúde resumido.
- Acesso rápido aos detalhes operacionais.

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

## Critérios de conclusão

- É possível entrar no painel com autenticação segura.
- É possível ver as máquinas monitoradas e seus estados básicos.
- É possível registrar e acompanhar incidentes.
- É possível visualizar o estado consolidado em um painel central.
- As regras críticas continuam na API e não na UI.

## Regra prática

- Se um item não ajuda a provar que o sistema vê, entende ou protege as VPS, ele fica fora da fase 1.
- Se uma automação puder aumentar o risco mais do que o benefício, ela fica para a próxima fase.
