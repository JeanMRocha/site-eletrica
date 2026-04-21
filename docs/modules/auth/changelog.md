# Auth Changelog

> Status: active
> Type: history
> Last updated: 2026-04-20
> Owner: security

Registro de mudanças do módulo de autenticação.

## Entradas

### 2026-04-20

- Mudança: criado `onboarding.md` e adicionados exemplos reais e códigos de resposta em `contracts.md`, além da distinção explícita entre estado vivo e snapshot no `current-state.md`.
- Motivo: tornar o pacote de `auth` pronto para onboarding e reduzir ambiguidade para quem entra no módulo.
- Impacto: o módulo ficou mais fácil de entender, operar e integrar com a futura API.
- Arquivos: `docs/modules/auth/onboarding.md`, `docs/modules/auth/contracts.md`, `docs/modules/auth/current-state.md`, `docs/modules/auth/README.md`

### 2026-04-20

- Mudança: simplificado o `README` do módulo `auth` para apontar para `reading-paths.md` como referência principal de leitura por escopo.
- Motivo: reduzir duplicação e manter o índice do módulo mais curto e mais fácil de manter.
- Impacto: o módulo ganhou uma hierarquia mais clara entre índice, leitura mínima e documentos auxiliares.
- Arquivos: `docs/modules/auth/README.md`, `docs/modules/auth/reading-paths.md`

### 2026-04-20

- Mudança: alinhado o índice do módulo `auth` para `stable`, ajustada a leitura mínima e criado o mapa de leitura específico do módulo.
- Motivo: refletir melhor o uso real do documento como ponto de entrada operacional e reduzir duplicação de orientação.
- Impacto: o índice de auth agora funciona como guia principal estável para o módulo, com leitura mínima mais clara.
- Arquivos: `docs/modules/auth/README.md`, `docs/modules/auth/reading-paths.md`

### 2026-04-20

- Mudança: criado `reading-paths.md` no módulo `auth` para orientar leitura mínima por tipo de alteração.
- Motivo: evitar abrir documentação de auth fora do escopo imediato e tornar o trabalho no módulo mais eficiente.
- Impacto: tarefas de login, sessão, segurança, operação e revisão têm caminhos mínimos explícitos.
- Arquivos: `docs/modules/auth/reading-paths.md`, `docs/modules/auth/README.md`

### 2026-04-20

- Mudança: reorganizado o módulo `auth` com `current-state` vivo, runbook operacional, contrato expandido e snapshots de decisão separados.
- Motivo: deixar auth mais claro para desenvolvimento, operação e manutenção profissional.
- Impacto: o módulo passou a ter documentação mais útil para mudanças locais e incidentes.
- Arquivos: `docs/modules/auth/current-state.md`, `docs/modules/auth/runbook.md`, `docs/modules/auth/contracts.md`, `docs/modules/auth/README.md`, `docs/modules/auth/adr/current-state.md`
