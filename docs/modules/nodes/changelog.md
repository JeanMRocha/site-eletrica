# Nodes Changelog

> Status: active
> Type: history
> Last updated: 2026-04-21
> Owner: platform

## Entradas

### 2026-04-21

- Mudança: criada a base do módulo `nodes` com conector SSH, probe de inventário mínimo e testes unitários com runner fake.
- Motivo: iniciar o canal padrão de controle da primeira VPS e separar o controle remoto da futura telemetria.
- Impacto: o projeto passou a ter a primeira espinha dorsal operacional para validar conectividade e inventário por SSH.
- Arquivos: `internal/nodes/*`, `docs/modules/nodes/*`

