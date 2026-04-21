# Nodes Security

> Status: draft
> Type: security
> Last updated: 2026-04-21
> Owner: security

## Controles mínimos

- Chave SSH dedicada por ambiente ou finalidade.
- Usuário não-root para o conector.
- `known_hosts` obrigatório.
- `sudo` restrito ao necessário.
- Logs de cada ação remota.

## Riscos

- Vazamento de chave privada.
- Execução remota excessiva.
- Uso de root direto.
- Host key spoofing.

## Exigências

- Não aceitar SSH inseguro por padrão.
- Não esconder comandos remotos que afetem produção.
- Registrar tentativa, alvo e resultado de cada probe ou ação.

