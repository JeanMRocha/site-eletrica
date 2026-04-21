# Conformidade - Contracts

> Status: draft
> Type: contracts
> Last updated: 2026-04-21
> Owner: repository

## Entrada esperada

```json
{
  "study_id": "ST-001",
  "circuit_id": "C1",
  "current_project_a": 17.3,
  "conductor_mm2": 2.5,
  "breaker_a": 20,
  "voltage_drop_percent": 3.1,
  "installation_method": "embutido",
  "environment_type": "quarto",
  "standard_version": "conformidade-br-2026.04"
}
```

## Saida esperada

```json
{
  "study_id": "ST-001",
  "circuit_id": "C1",
  "status": "conforme",
  "severity": "none",
  "rules_applied": ["PROT_DISJ_001", "COND_SEC_002"],
  "messages": [
    "Protecao compativel com a corrente de projeto.",
    "Secao do condutor aceita para o cenario informado."
  ],
  "requires_human_review": false
}
```

## Contrato minimo

- Identificador do estudo.
- Identificador do circuito ou item validado.
- Lista de regras aplicadas.
- Status consolidado.
- Mensagens de explicacao.
- Indicador de revisao humana.
