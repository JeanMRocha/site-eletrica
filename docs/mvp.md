# MVP Técnico

> Status: active
> Type: roadmap
> Last updated: 2026-04-21
> Owner: repository

Escopo mínimo para transformar o problema do produto em um sistema útil, sem excesso de automação ou complexidade prematura.

## Objetivo

- Centralizar a visão das VPS e sistemas em um painel único.
- Monitorar saúde, segurança e desempenho.
- Registrar incidentes e histórico.
- Permitir ações controladas e auditáveis.

## Obrigatório

### 1. Inventário

- Listar as máquinas monitoradas.
- Registrar papel de cada VPS.
- Guardar provider, ambiente, endereço e estado.

### 2. Autenticação e autorização

- Proteger o painel com login seguro.
- Separar operador com permissões explícitas.
- Registrar eventos de acesso.

### 3. Monitoramento básico

- Heartbeats.
- Uptime.
- CPU, memória, disco e rede.
- Estado dos serviços principais.

### 4. Incidentes

- Detectar falha ou degradação.
- Registrar severidade.
- Registrar início, resolução e histórico.

### 5. Painel central

- Exibir o estado das máquinas.
- Exibir alertas e incidentes.
- Exibir histórico e ações recentes.

### 6. Controle SSH básico

- Definir SSH como canal padrão de controle para a primeira VPS.
- Guardar host, porta, usuário e chave no ambiente seguro.
- Validar conexão e coleta mínima de inventário via SSH.
- Manter adaptadores alternativos como extensão futura, não como dependência inicial.

## Opcional no começo

- Remediação automática avançada.
- Otimização autônoma de desempenho.
- Múltiplos níveis de aprovação para ações sensíveis.
- Dashboards muito detalhados de observabilidade.
- Migração automática entre provedores.
- Orquestração complexa própria.

## Arquitetura ideal para este caso

- API em `Go` como fonte de verdade.
- UI em `vinext` apenas como camada de experiência.
- Persistência em `PostgreSQL`.
- Agentes Docker rodando nas máquinas monitoradas.
- VPS Oracle como ponto externo de monitoramento.
- VPS local como suporte, laboratório e contingência.
- SSH como canal padrão de controle para manutenção e troubleshooting.
- Adaptadores futuros para provider API ou outros mecanismos quando houver necessidade real.

## Prioridade de construção

1. Inventário e autenticação
2. Monitoramento básico
3. Incidentes e histórico
4. Painel central
5. Controle SSH básico
6. Ações controladas
7. Melhorias de desempenho e suporte

## Critério de sucesso

- Eu consigo ver o estado das VPS em um único lugar.
- Eu consigo saber quando algo falha.
- Eu consigo entender o que aconteceu e quando.
- Eu consigo agir de forma controlada e auditável.
- Eu consigo manter a solução portátil entre provedores.
- Eu consigo conectar e operar a VPS principal por SSH com controle explícito.

## Regra prática

- Se algo não ajuda a reduzir risco, aumentar visibilidade ou controlar operação, ele não entra no MVP.
- Se uma automação puder causar mais dano do que benefício no começo, ela fica para depois.
- Se uma integração alternativa não melhorar controle, visibilidade ou portabilidade, ela fica como adapter futuro.
