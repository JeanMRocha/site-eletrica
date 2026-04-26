# Skill: Identidade Visual e UI/UX Premium

## Objetivo
Garantir que a interface do projeto seja coesa, profissional e premium, utilizando padrões consistentes de design e experiência do usuário.

## Princípios obrigatórios
- **Hierarquia Visual**: O que é mais importante deve ter mais destaque.
- **Consistência**: Elementos iguais devem se comportar e parecer iguais em todo o sistema.
- **Espaçamento (White Space)**: Usar o respiro para organizar a informação, não o ruído visual.
- **Proximidade**: Elementos relacionados devem estar próximos.
- **Acessibilidade**: Contraste adequado e navegação clara.
- **Micro-interações**: Feedback visual para cada ação do usuário (hover, click, loading).

## Regras obrigatórias
1. **Tokens sobre Ad-hoc**: Nunca usar cores ou margens "mágicas". Usar variáveis do Design System.
2. **Resiliência**: A UI não deve quebrar com textos longos ou telas pequenas.
3. **Feedback Imediato**: Toda ação assíncrona deve mostrar um estado de loading ou skeleton.
4. **Alinhamento**: Seguir uma grade (grid) consistente.
5. **Tipografia**: Usar no máximo 2 famílias de fontes com pesos bem definidos.

## Processo obrigatório
Antes de alterar estilos, executar:

1. **Auditoria Visual**: Identificar inconsistências no trecho atual.
2. **Definição de Tokens**: Verificar se os estilos necessários já existem no `index.css`.
3. **Aplicação Incremental**: Refatorar o CSS para usar variáveis.
4. **Verificação Responsiva**: Testar em Mobile, Tablet e Desktop.
5. **Revisão de Estados**: Validar estados de Error, Empty e Loading.

## Saída esperada
- Interface visualmente "limpa" e moderna.
- CSS modular e reutilizável.
- Experiência de uso fluida (delightful UX).
