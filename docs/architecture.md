# Architecture

> Status: stable
> Type: architecture
> Last updated: 2026-04-20
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

### Persistence

- Store system state, incident history, node inventory, action logs, and configuration
- Keep audit trails immutable where possible

## Node topology

- Main VPS: primary workload and main agent
- Oracle Free Tier: remote monitoring, backup, and independent reachability checks
- Local Proxmox: support services, test environments, and contingency workloads

## Communication model

- Agents should initiate outbound HTTPS connections to the API
- Avoid relying on inbound access to every node
- Use signed requests or short-lived credentials
- Version all external APIs

## Runtime posture

- Everything deployable should be container-friendly
- No hard dependency on a specific hosting provider
- Use environment variables and secrets management for deployment-specific data
