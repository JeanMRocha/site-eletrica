# Product Overview

> Status: stable
> Type: architecture
> Last updated: 2026-04-20
> Owner: repository

Visão de produto para orientar leitura, módulos e decisões de documentação.

## What this is

- A control plane for monitoring, diagnosing, and safely remediating infrastructure.
- A product that favors portability, provider independence, and container-first deployment.

## Contexto operacional atual

- A VPS principal hospeda os sistemas em produção e roda atualmente em um provedor externo, com Coolify e padrão Docker.
- Uma VPS Oracle Free Tier serve como ponto independente de monitoramento da VPS principal.
- Uma VPS local serve como laboratório, suporte e apoio para armazenamento ou desempenho quando necessário.
- O objetivo imediato é centralizar a visão, a segurança e a saúde desses ambientes em um painel administrativo único.

## Primary flows

- Observe node health and telemetry.
- Detect incidents and degraded conditions.
- Review audit trails and historical events.
- Trigger controlled remediation actions.
- Manage authentication and authorization for operators.
- Surface the current state of the main VPS, monitoring VPS, and local support VPS in one place.

## Main areas

- `auth`: authentication, authorization, session handling, and security gates.
- `nodes`: remote agents, telemetry, and health snapshots.
- `incidents`: detection, triage, and remediation tracking.
- `dashboard`: operator-facing views and workflows.

## Non-goals

- Frontend-driven business rules.
- Provider-specific coupling.
- Hidden operational steps without auditability.

## Documentation rule

- Use this file when you need the product context before entering module or architecture detail.
