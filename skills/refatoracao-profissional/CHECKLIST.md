# Checklist de Refatoração

## Antes de alterar
- [ ] Entendi o objetivo da refatoração
- [ ] Identifiquei os módulos afetados
- [ ] Li os arquivos relevantes
- [ ] Localizei testes existentes
- [ ] Identifiquei riscos de quebra

## SOLID
- [ ] Cada módulo tem uma responsabilidade clara
- [ ] Não há função/classe fazendo coisa demais
- [ ] Dependências estão bem separadas
- [ ] Interfaces não obrigam uso desnecessário
- [ ] Código depende de abstrações quando necessário

## DRY
- [ ] Não há repetição relevante de lógica
- [ ] Regras duplicadas foram centralizadas
- [ ] Constantes repetidas foram nomeadas

## KISS
- [ ] A solução ficou mais simples
- [ ] Não foram criadas camadas desnecessárias
- [ ] Nomes ficaram mais claros

## YAGNI
- [ ] Nada foi criado para hipótese futura
- [ ] Código morto foi removido
- [ ] Abstrações sem uso foram evitadas

## Testes
- [ ] Testes existentes continuam passando
- [ ] Testes novos foram criados quando necessário
- [ ] Casos de regressão foram cobertos
