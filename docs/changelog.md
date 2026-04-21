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
