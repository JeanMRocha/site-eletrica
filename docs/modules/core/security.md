# Core - Security

> Status: draft
> Type: security
> Last updated: 2026-04-21
> Owner: repository

## Riscos principais

- Contrato compartilhado quebrar varios modulos ao mesmo tempo.
- Auditoria ficar inconsistente entre camadas.
- Unidades diferentes gerarem calculos errados.

## Controles

- Versionar contratos compartilhados.
- Validar unidade antes de calcular.
- Registrar trilha de auditoria sempre que houver mudanca relevante.

## Limites

- `core` nao deve ser usado para esconder dependencia circular.
