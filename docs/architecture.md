# Architecture

> Status: stable
> Type: architecture
> Last updated: 2026-04-21
> Owner: platform

## Goal

Build a portable infrastructure control plane to monitor, alert, diagnose, and apply safe remediation actions across multiple machines.

## High-level design

- Web layer: `vinext`
- API layer: `Go`
- Persistence: `PostgreSQL`
- Execution model: Docker-based agents running on each node
- Orchestration: Coolify where it fits operationally
- External redundancy: Oracle Free Tier
- Local lab and support: Proxmox
- Primary operator control channel: SSH

## Responsibilities

### Web layer

- Display health, incidents, nodes, actions, and trends
- Provide operator workflows
- Never act as the source of truth
- Never hold business-critical rules that must survive frontend replacement

### Go API

- Own authentication and authorization decisions
- Receive heartbeats and telemetry summaries
- Evaluate health rules
- Trigger remediation actions
- Record audit events and incidents
- Expose stable, versioned endpoints

### Node agent

- Collect local metrics
- Detect node-level conditions
- Send heartbeats and snapshots to the API
- Execute narrowly scoped actions approved by policy
- Prefer safe, idempotent operations

### Control channel

- Use SSH as the default operator control path for bootstrap, troubleshooting, maintenance, and controlled remediation.
- Prefer key-based authentication with a dedicated non-root operator account and restricted sudo.
- Keep telemetry and control separate so operator actions do not depend on the same transport as health reporting.
- Treat provider APIs, remote consoles, and future integrations as optional adapters instead of the primary contract.
- If the current node still uses `root` for SSH, treat that as a transitional state and schedule a dedicated operator user as a security improvement.

### Persistence

- Store system state, incident history, node inventory, action logs, and configuration
- Keep audit trails immutable where possible

## Node topology

- Main VPS on the current hosting provider: primary workload and main agent
- Oracle Free Tier: remote monitoring, backup, and independent reachability checks
- Local VPS/Proxmox support environment: support services, test environments, storage, and contingency workloads
- Main VPS snapshot on 2026-04-21: `srv856573.hstgr.cloud`, `78.142.242.236`, Ubuntu 24.04 with Coolify, `KVM 2`, `2` CPU, `8 GB` RAM, `100 GB` disk, auto-renewal active until `2027-06-05`

## Operational intent

- Centralize health, security, and performance visibility across the three environments.
- Keep the main production workloads portable so the hosting provider can change in the future.
- Use the monitoring VPS as an external point of trust, not as the source of business truth.
- Use the local environment to absorb support workloads or improve performance when needed.
- Keep remediations controlled and auditable from the API.

## Communication model

- Operators may use SSH directly or through an adapter managed by the control plane.
- Agents should initiate outbound HTTPS connections to the API
- Avoid relying on inbound access to every node
- Use signed requests or short-lived credentials
- Version all external APIs

## Runtime posture

- Everything deployable should be container-friendly
- No hard dependency on a specific hosting provider
- Use environment variables and secrets management for deployment-specific data
