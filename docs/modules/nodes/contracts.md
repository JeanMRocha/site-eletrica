# Nodes Contracts

> Status: draft
> Type: contracts
> Last updated: 2026-04-21
> Owner: platform

## Contratos principais

- `nodes.SSHConfig`
- `nodes.Inventory`
- `nodes.ProbeResult`
- `nodes.SSHProbe.Probe(...)`

## Regras de contrato

- O conector SSH deve exigir host, usuário, chave privada e known_hosts.
- O inventário deve expor apenas o necessário para operação inicial.
- Falhas em comandos opcionais devem gerar warnings, não quebra total do probe.
- Falhas em comandos críticos devem falhar rápido.

## Uso esperado

- O primeiro probe coleta hostname, kernel, uptime e uma síntese de disco.
- Informações de docker podem ser coletadas como complemento.
- O inventário operacional da VPS principal deve registrar provider, região, hostname, IP, plano, recursos, renovação e usuário SSH.
- O primeiro probe operacional usa as variáveis `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY_PATH` e `SSH_KNOWN_HOSTS_PATH` do ambiente.
