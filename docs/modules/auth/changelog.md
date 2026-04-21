# Auth Changelog

> Status: active
> Type: history
> Last updated: 2026-04-20
> Owner: security

Registro de mudanças do módulo de autenticação.

## Entradas

### 2026-04-20

- Mudança: formalizada a regra de quando abrir um novo `plan` no módulo `auth` versus quando apenas atualizar `plan`, `current-state` e `changelog`.
- Motivo: evitar fragmentação desnecessária da execução do módulo e manter o estado vigente alinhado ao trabalho real.
- Impacto: auth passa a distinguir evolução do mesmo esforço de uma nova execução com escopo diferente.
- Arquivos: `docs/modules/auth/plan-lifecycle.md`, `docs/modules/auth/current-state-lifecycle.md`, `docs/modules/auth/active-plan.md`, `docs/modules/auth/adr/current-state.md`

### 2026-04-20

- Mudança: adicionados os ciclos de vida de `plan` e `current-state` do módulo `auth`, com archive próprio do módulo.
- Motivo: manter o módulo crítico com documentação de execução e estado bem delimitada.
- Impacto: auth passou a ter regra explícita para pausar, concluir e arquivar documentos de plano e estado.
- Arquivos: `docs/modules/auth/plan-lifecycle.md`, `docs/modules/auth/current-state-lifecycle.md`, `docs/modules/auth/archive/README.md`, `docs/modules/auth/README.md`, `docs/modules/auth/active-plan.md`, `docs/modules/auth/adr/current-state.md`

### 2026-04-20

- Mudança: formalizada a regra de ciclo de vida dos ADRs do módulo `auth`, incluindo `superseded`, `archive/` e `deprecated`.
- Motivo: manter o histórico do módulo útil sem multiplicar decisões antigas.
- Impacto: auth passou a seguir uma regra explícita para substituir, arquivar ou depreciar ADRs.
- Arquivos: `docs/modules/auth/adr/README.md`, `docs/modules/auth/adr/template.md`, `docs/modules/auth/adr/current-state.md`

### 2026-04-20

- Mudança: criados os templates oficiais de `plan` e `current-state` do módulo `auth` e aplicados aos documentos ativos.
- Motivo: manter o módulo com governança curta, consistente e fácil de revisar.
- Impacto: o módulo passou a ter modelo padronizado para execução corrente e estado vigente.
- Arquivos: `docs/modules/auth/plan-template.md`, `docs/modules/auth/current-state-template.md`, `docs/modules/auth/active-plan.md`, `docs/modules/auth/adr/current-state.md`, `docs/modules/auth/README.md`

### 2026-04-20

- Mudança: criado o template oficial de ADR do módulo `auth` e aplicado aos ADRs existentes.
- Motivo: manter as decisões do módulo curtas, revisáveis e padronizadas.
- Impacto: o módulo ganhou um formato único para decisões de arquitetura, com contexto, decisão, alternativas, consequências e critérios de revisão.
- Arquivos: `docs/modules/auth/adr/template.md`, `docs/modules/auth/adr/0001-auth-governance.md`, `docs/modules/auth/adr/0002-session-model.md`, `docs/modules/auth/adr/README.md`, `docs/modules/auth/adr/current-state.md`, `docs/modules/auth/adr/archive/README.md`

### 2026-04-20

- Mudança: formalizada a política local de ciclo de vida de ADR para o módulo `auth`.
- Motivo: evitar duplicação de decisões e manter apenas o estado vigente e o histórico útil.
- Impacto: o módulo ganhou `current-state` e `archive` para separar decisão ativa de histórico.
- Arquivos: `docs/modules/auth/adr/README.md`, `docs/modules/auth/adr/current-state.md`, `docs/modules/auth/adr/archive/README.md`

### 2026-04-20

- Mudança: criado o esqueleto de decisão do módulo `auth` com ADRs iniciais.
- Motivo: registrar governança local para autenticação, sessão e segurança.
- Impacto: o módulo ganhou trilha de decisão própria para futuras implementações.
- Arquivos: `docs/modules/auth/adr/README.md`, `docs/modules/auth/adr/0001-auth-governance.md`, `docs/modules/auth/adr/0002-session-model.md`

### 2026-04-20

- Mudança: criado o esqueleto de documentação do módulo `auth`.
- Motivo: isolar regras, contratos, segurança e testes em uma área própria.
- Impacto: o agente pode ler apenas os documentos do módulo quando a alteração for local.
- Arquivos: `docs/modules/auth/README.md`, `docs/modules/auth/rules.md`, `docs/modules/auth/contracts.md`, `docs/modules/auth/security.md`, `docs/modules/auth/tests.md`, `docs/modules/auth/active-plan.md`, `docs/modules/auth/changelog.md`
