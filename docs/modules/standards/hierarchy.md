# Standards Hierarchy

> Status: draft
> Type: hierarchy
> Last updated: 2026-04-21
> Owner: platform

## Ordem de precedência

- Constitution
- Laws
- Decrees
- Regulatory norms
- Concessionary rules
- Technical standards
- Internal rules and best practices

## Matrix

```yaml
hierarchy:
  - id: constitution
    weight: 100
  - id: law
    weight: 90
  - id: decree
    weight: 80
  - id: nr
    weight: 70
  - id: concessionary
    weight: 60
  - id: normative
    weight: 50
  - id: internal
    weight: 10
```

## Regras

- A arvore organiza.
- O motor decide.
- Em conflito, a regra de maior peso vence.
- Em conflito de seguranca, a regra de seguranca deve ser tratada como prioridade local no motor.
