# Nodes Current State

> Status: draft
> Type: current-state
> Last updated: 2026-04-21
> Owner: platform

## Current state

- Existe uma base de conector SSH em Go.
- O probe coleta inventário mínimo e tolera falhas em comandos opcionais.
- A persistência de nós e o heartbeat ainda não existem.
- A VPS principal já foi registrada como snapshot operacional da camada de nodes.
- O inventário operacional da VPS principal já está modelado como `Node` e exposto como ponto de leitura na API.

## Main VPS snapshot

- Provider/location: Brazil, São Paulo
- Operating system: Ubuntu 24.04 with Coolify
- Hostname: `srv856573.hstgr.cloud`
- IPv4: `78.142.242.236`
- SSH user: `root`
- Plan: `KVM 2`
- CPU cores: `2`
- Memory: `8 GB`
- Disk: `100 GB`
- Auto-renewal: active
- Plan valid until: `2027-06-05`
- Snapshot observed: `2026-04-21`

## Invariants

- SSH é o canal padrão de controle.
- `known_hosts` é obrigatório.
- O módulo não deve depender de um provedor específico.

## Operational notes

- Use este módulo para validar conectividade e inventário da primeira VPS.
- Evolua para heartbeat e persistência depois.
- O usuário SSH atual é `root`; isso deve ser trocado por um usuário operacional dedicado quando a base segura estiver pronta.
- O próximo passo natural é ligar a rota de probe manual ao host real com credenciais controladas.
- O probe operacional agora lê a VPS principal do `.env` e pode ser acionado pela API.
