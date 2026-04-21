# Product Overview

> Status: stable
> Type: architecture
> Last updated: 2026-04-21
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
- Snapshot operacional da VPS principal em 2026-04-21: `srv856573.hstgr.cloud`, `78.142.242.236`, Ubuntu 24.04 with Coolify, `KVM 2`, `2` CPU, `8 GB` RAM, `100 GB` disk, auto-renewal active until `2027-06-05`.

## Primary flows

- Observe node health and telemetry.
- Detect incidents and degraded conditions.
- Review audit trails and historical events.
- Trigger controlled remediation actions.
- Manage authentication and authorization for operators.
- Surface the current state of the main VPS, monitoring VPS, and local support VPS in one place.
- Use SSH as the default control path for remote maintenance and troubleshooting.
- Keep telemetry separate from operator actions so health reporting remains lightweight.
- Treat the current SSH user as a transitional operational detail until the node is moved to a dedicated non-root account.

## Main areas

- `auth`: authentication, authorization, session handling, and security gates.
- `nodes`: remote agents, telemetry, and health snapshots.
- `incidents`: detection, triage, and remediation tracking.
- `dashboard`: operator-facing views and workflows.

## Non-goals

- Frontend-driven business rules.
- Provider-specific coupling.
- Hidden operational steps without auditability.
- Making provider APIs the primary control path.

## Documentation rule

- Use this file when you need the product context before entering module or architecture detail.
- Use `docs/mvp.md` when you need to separate the minimum necessary from future expansion.
