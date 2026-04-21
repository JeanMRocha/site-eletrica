# Histórico de Mudanças

> Status: active
> Type: history
> Last updated: 2026-04-20
> Owner: repository

Registro cronológico das mudanças relevantes no repositório.

## Formato sugerido

- Data: `AAAA-MM-DD`
- Mudança: descrição objetiva do que foi alterado
- Motivo: por que a mudança foi feita
- Impacto: efeito prático para a base, a API ou a UI
- Arquivos: principais arquivos afetados

## Modelo de entrada

```md
### AAAA-MM-DD

- Mudança: ...
- Motivo: ...
- Impacto: ...
- Arquivos: `arquivo-1`, `arquivo-2`
```

## Entradas

### 2026-04-20

- Mudança: simplificado `docs/README.md` para funcionar só como índice de entrada, sem repetir a política central de navegação.
- Motivo: reduzir duplicação com `docs/governance.md` e deixar o arquivo raiz mais leve.
- Impacto: o ponto de entrada de `docs/` ficou mais curto e mais fácil de manter sem competir com a governança.
- Arquivos: `docs/README.md`

### 2026-04-20

- Mudança: enxugado `docs/modules/README.md` para reduzir repetição com a governança e deixar o índice de módulos mais direto.
- Motivo: diminuir ruído, manter uma autoridade principal única para navegação e tornar a leitura por módulo mais objetiva.
- Impacto: a pasta de módulos ficou com um índice mais curto e mais fácil de manter sem duplicar a política central.
- Arquivos: `docs/modules/README.md`

### 2026-04-20

- Mudança: enxugada a duplicação entre `docs/modules/auth/README.md` e `docs/modules/auth/reading-paths.md`, deixando o `reading-paths` como referência principal de leitura por escopo no módulo.
- Motivo: reduzir repetição, diminuir risco de drift e tornar a hierarquia documental mais profissional.
- Impacto: o `README` de auth passou a ser um ponto de entrada mais curto, sem repetir a lista mínima de leitura do módulo.
- Arquivos: `docs/modules/auth/README.md`, `docs/modules/auth/reading-paths.md`

### 2026-04-20

- Mudança: centralizada a autoridade de navegação em `docs/governance.md`, formalizada a política de idioma em `docs/agent-rules.md` e `docs/development-principles.md`, e alinhado o índice de `auth` para `stable`.
- Motivo: reduzir duplicação, deixar a leitura por escopo mais clara e tornar a linguagem da documentação mais profissional e previsível.
- Impacto: a navegação por docs passou a ter uma fonte principal explícita, a política de idioma ficou formalizada e o índice de `auth` passou a refletir melhor seu uso real.
- Arquivos: `docs/governance.md`, `docs/reading-paths.md`, `docs/modules/README.md`, `docs/modules/auth/README.md`, `docs/modules/auth/reading-paths.md`, `docs/agent-rules.md`, `docs/development-principles.md`

### 2026-04-20

- Mudança: criado `docs/modules/auth/reading-paths.md` com caminhos mínimos de leitura por tipo de trabalho em auth.
- Motivo: reduzir leitura desnecessária dentro do módulo mais sensível do sistema e deixar o fluxo de navegação mais objetivo.
- Impacto: alterações em auth passam a ter um subconjunto explícito de docs para ler antes de abrir documentação não relacionada.
- Arquivos: `docs/modules/auth/reading-paths.md`, `docs/modules/auth/README.md`, `docs/modules/README.md`

### 2026-04-20

- Mudança: refinado `docs/reading-paths.md` para uma tabela operacional com leitura mínima, opcional e documentos que devem ficar fora do padrão.
- Motivo: tornar o guia mais prático para uso diário e reduzir o risco de abrir documentação desnecessária.
- Impacto: o perfil de leitura ficou mais direto, curto e aplicável na rotina do agente e de colaboradores.
- Arquivos: `docs/reading-paths.md`

### 2026-04-20

- Mudança: criado `docs/reading-paths.md` com mapas de leitura por perfil para novo contribuidor, auth, operação e revisão de arquitetura.
- Motivo: reduzir carga desnecessária de documentação e deixar a navegação mais profissional e orientada ao escopo.
- Impacto: o agente e os colaboradores passam a ter um caminho mínimo de leitura por perfil antes de abrir docs fora do escopo.
- Arquivos: `docs/reading-paths.md`, `docs/README.md`, `docs/governance.md`, `docs/modules/README.md`

### 2026-04-20

- Mudança: reorganizada a documentação para incluir `product-overview.md`, `current-state.md`, runbook de `auth`, matriz de governança e separação entre estado vivo e snapshots de decisão.
- Motivo: reduzir duplicação, melhorar navegação e deixar o docs mais profissional e orientado a uso real.
- Impacto: a documentação passou a ter um fluxo mais claro para leitura, escrita, operação e histórico.
- Arquivos: `docs/product-overview.md`, `docs/current-state.md`, `docs/governance.md`, `docs/README.md`, `docs/modules/README.md`, `docs/modules/auth/README.md`, `docs/modules/auth/current-state.md`, `docs/modules/auth/runbook.md`, `docs/modules/auth/contracts.md`, `docs/adr/current-state.md`, `docs/modules/auth/adr/current-state.md`
