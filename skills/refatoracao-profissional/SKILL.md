# Skill: Refatoração Profissional

## Objetivo
Aplicar refatoração segura, incremental e rastreável no projeto, usando princípios de engenharia de software.

## Princípios obrigatórios
- SOLID
- DRY
- KISS
- YAGNI
- Clean Architecture quando fizer sentido
- Baixo acoplamento
- Alta coesão
- Separação de responsabilidades
- Testabilidade
- Manutenibilidade

## Regras obrigatórias
1. Nunca alterar comportamento sem declarar.
2. Nunca adicionar funcionalidade nova durante refatoração.
3. Nunca reescrever o projeto inteiro de uma vez.
4. Nunca criar abstração sem necessidade real.
5. Sempre preferir simplificar antes de sofisticar.
6. Sempre preservar compatibilidade com o fluxo atual.
7. Sempre validar impacto antes de modificar.
8. Sempre criar ou ajustar testes quando alterar lógica.

## Processo obrigatório
Antes de alterar código, executar:

1. Diagnóstico
2. Mapa de problemas
3. Plano de refatoração
4. Refatoração incremental
5. Testes
6. Revisão final

## Diagnóstico obrigatório
Para cada problema encontrado, classificar:

- Arquivo
- Trecho afetado
- Princípio violado
- Risco atual
- Proposta de correção
- Impacto esperado
- Prioridade

## Critérios de parada
Parar antes de executar se:
- A alteração mudar regra de negócio
- Houver risco de quebra não testada
- O escopo estiver grande demais
- Faltar contexto essencial

## Saída esperada
Toda execução deve entregar:

- Resumo técnico
- Lista de alterações
- Justificativa das decisões
- Testes executados
- Próximos passos
