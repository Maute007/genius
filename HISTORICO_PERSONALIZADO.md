# 📊 Histórico Real e Personalizado - Dashboard Genius

## 🎯 Visão Geral

O Dashboard do Genius agora conta com um sistema de histórico real e insights personalizados baseados na API do Claude, utilizando as informações de onboarding de cada usuário para gerar uma experiência única e contextualizada.

## ✨ Funcionalidades Implementadas

### 1. **Histórico de Conversas Enriquecido**

O histórico agora exibe informações detalhadas sobre cada conversa:

- **Título da conversa** (gerado automaticamente ou definido pelo usuário)
- **Assunto e Tópico** (ex: "Matemática • Equações do 2º grau")
- **Modo de aprendizagem** (Dúvida Rápida, Preparação para Exame, Revisão, Aprendizagem Livre)
- **Data da conversa** em formato moçambicano (pt-MZ)
- **Número de perguntas** do estudante
- **Total de mensagens** na conversa
- **Preview da última pergunta** do estudante
- **Indicador visual** se há mensagens na conversa

### 2. **Insights Personalizados com Claude**

Sistema de insights gerados pela API do Claude que analisa:

#### Dados do Perfil:
- Nome, idade e classe/nível
- Interesses pessoais (ex: futebol, música, ciência)
- Preferências de aprendizagem (exemplos práticos, diagramas, vídeos)
- Dificuldades acadêmicas relatadas
- Objetivos de estudo
- Escola, cidade e província

#### Atividade Recente:
- Total de conversas criadas
- Assuntos estudados
- Modos de aprendizagem utilizados
- Frequência de uso

#### Progresso de Aprendizagem:
- Tópicos praticados
- Nível de domínio (%)
- Quantidade de práticas por tópico

### 3. **Geração Inteligente de Insights**

O Claude analisa todo o contexto e gera **3-5 insights personalizados** que:

✅ Reconhecem o progresso atual do estudante
✅ Conectam com os interesses pessoais
✅ Sugerem próximos passos baseados em dificuldades
✅ Motivam e encorajam o aprendizado
✅ São específicos e contextualizados para cada usuário

#### Exemplo de Insights:
```
"Excelente progresso! Já tens 15 conversas no Genius e estás a desenvolver 
uma base sólida em Matemática e Física."

"Os teus interesses em futebol e ciência podem ser ótimos pontos de partida 
para explorar física aplicada ao desporto!"

"Lembra-te do teu objetivo de entrar na UEM. Cada pergunta te aproxima dele! 
Que tal focar em resolver mais exercícios de química?"
```

### 4. **Fallback Inteligente**

Se a API do Claude falhar, o sistema usa **insights estáticos baseados em regras** que ainda assim são personalizados com base no perfil:

- Mensagens de boas-vindas para novos usuários
- Reconhecimento de progresso
- Sugestões baseadas em interesses
- Lembretes de objetivos

## 🔧 Implementação Técnica

### Backend (server/routers.ts)

#### Endpoint: `dashboard.recentConversations`
```typescript
// Retorna conversas com dados enriquecidos
recentConversations: protectedProcedure
  .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
  .query(async ({ ctx, input }) => {
    // Busca conversas do usuário
    // Adiciona contagem de mensagens
    // Adiciona preview da última mensagem
    // Retorna dados estruturados
  })
```

#### Endpoint: `dashboard.personalizedInsights`
```typescript
// Gera insights personalizados usando Claude
personalizedInsights: protectedProcedure
  .query(async ({ ctx }) => {
    // 1. Busca perfil do usuário
    // 2. Coleta atividade recente
    // 3. Busca progresso de aprendizagem
    // 4. Constrói contexto personalizado
    // 5. Chama Claude para gerar insights
    // 6. Retorna insights + sumário
  })
```

### Frontend (client/src/pages/Dashboard.tsx)

#### Queries tRPC:
```typescript
// Busca conversas enriquecidas
const conversationsQuery = trpc.dashboard.recentConversations.useQuery({ limit: 5 });

// Busca insights personalizados
const insightsQuery = trpc.dashboard.personalizedInsights.useQuery();
```

#### Componentes Visuais:

1. **Card de Insights Personalizados**
   - Design com gradiente teal/blue
   - Ícone de lâmpada (Lightbulb)
   - Lista de insights com hover effects
   - Sumário com estatísticas

2. **Card de Histórico de Conversas**
   - Layout card melhorado
   - Informações hierárquicas (título, assunto/tópico, modo)
   - Badges e indicadores visuais
   - Preview da última mensagem
   - Botão "Ver todas" quando há muitas conversas

## 🚀 Como Funciona

### Fluxo de Dados:

1. **Usuário faz onboarding** → Informações salvas no perfil
2. **Usuário usa o chat** → Conversas registradas no banco
3. **Acessa dashboard** → Sistema busca dados do perfil e atividade
4. **Claude analisa contexto** → Gera insights personalizados
5. **Dashboard exibe** → Histórico rico + insights motivadores

### Prompt para Claude:

```
És um assistente educacional que analisa o progresso de estudantes 
e gera insights personalizados e motivadores.

TAREFA:
Com base no perfil e atividade do estudante, gera 3-5 insights curtos 
e motivadores em português de Moçambique.

FORMATO:
Retorna APENAS uma lista JSON com os insights.
Exemplo: ["Insight 1...", "Insight 2...", "Insight 3..."]
```

## 📊 Métricas Exibidas

### No Card de Insights:
- 📊 Total de conversas
- 📚 Número de assuntos estudados
- ✨ Tópicos praticados

### No Card de Conversas:
- 💬 Número de perguntas por conversa
- 📝 Total de mensagens
- 📅 Data da conversa
- 🏷️ Modo de aprendizagem

## 🎨 Design e UX

### Cores e Estilo:
- **Insights**: Gradiente teal/blue com bordas teal
- **Conversas**: Cards com hover effects e sombras
- **Ícones**: Lucide icons contextuais
- **Tipografia**: Hierarquia clara com tamanhos variados

### Responsividade:
- Grid adaptativo (lg:grid-cols-2)
- Espaçamento consistente
- Cards empilháveis em mobile

### Estados:
- ✅ Carregando (spinner/skeleton)
- ✅ Vazio (mensagens motivadoras)
- ✅ Com dados (exibição rica)
- ✅ Erro (fallback para insights estáticos)

## 🔒 Segurança e Performance

### Segurança:
- ✅ Endpoints protegidos (`protectedProcedure`)
- ✅ Validação de ownership (conversas pertencem ao usuário)
- ✅ Sanitização de dados do Claude

### Performance:
- ✅ Queries com limite (5-10 itens)
- ✅ Cache automático do tRPC
- ✅ Carregamento paralelo (conversas + insights)
- ✅ Fallback rápido em caso de erro

## 🧪 Testando

### 1. Criar Perfil Completo:
```
1. Fazer login
2. Completar onboarding com:
   - Interesses variados
   - Preferências de aprendizagem
   - Dificuldades específicas
   - Objetivos claros
```

### 2. Gerar Atividade:
```
1. Criar 5-10 conversas
2. Usar diferentes modos
3. Fazer perguntas sobre assuntos variados
4. Praticar alguns tópicos múltiplas vezes
```

### 3. Verificar Dashboard:
```
1. Acessar /dashboard
2. Verificar insights personalizados
3. Conferir histórico de conversas
4. Testar navegação para chat
```

## 🐛 Debugging

### Console Logs:
```javascript
// Frontend
console.log("🔍 Dashboard - Conversas recebidas:", conversationsQuery.data);
console.log("💡 Dashboard - Insights recebidos:", insightsQuery.data);

// Backend
console.log('[Dashboard] Generating insights for user:', userId);
console.log('[Dashboard] Profile context:', userContext);
```

### Verificar API do Claude:
- Checar se `ENV.ANTHROPIC_API_KEY` está configurado
- Verificar logs de erro no backend
- Testar fallback quando Claude não responde

## 🔮 Próximos Passos

### Melhorias Futuras:
1. **Gráficos de progresso** (Chart.js / Recharts)
2. **Timeline de aprendizagem** visual
3. **Metas semanais/mensais** rastreáveis
4. **Conquistas e badges** gamificação
5. **Comparação com colegas** (anonimizado)
6. **Recomendações de conteúdo** baseadas em IA
7. **Notificações push** para revisão espaçada

### Integrações:
- Export de progresso (PDF/CSV)
- Compartilhamento social
- API para escolas (dashboard institucional)

## 📚 Recursos Relacionados

- `server/routers.ts` - Endpoints do dashboard
- `client/src/pages/Dashboard.tsx` - Interface do dashboard
- `server/db.ts` - Funções de banco de dados
- `server/_core/llm.ts` - Integração com Claude
- `drizzle/schema.ts` - Schema do banco

## 💡 Dicas

1. **Perfil completo = Insights melhores**: Incentive usuários a preencher tudo no onboarding
2. **Atividade regular = Histórico rico**: Quanto mais uso, melhores os insights
3. **Monitore falhas do Claude**: Configure alertas para fallbacks frequentes
4. **A/B test insights**: Teste diferentes estilos de mensagens

---

**Desenvolvido com ❤️ para estudantes moçambicanos**

*Última atualização: 9 de Dezembro de 2025*
