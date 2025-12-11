# 📚 Sistema de Revisão Inteligente - Genius

## 🎯 Visão Geral

O sistema de revisão do Genius agora é completamente baseado no **histórico real de conversas** do usuário e nas **informações do onboarding**, proporcionando uma experiência de revisão personalizada e eficiente usando a API do Claude.

## ✨ Funcionalidades Principais

### 1. **Revisão Baseada em Histórico Real**

❌ **ANTES (Mockado):**
```typescript
const topics = [
  { subject: "Matemática", topic: "Equações", masteryLevel: 85 },
  // ... dados fictícios
];
```

✅ **AGORA (Dados Reais):**
- Extrai tópicos das conversas reais do usuário
- Combina com dados da tabela `learningProgress`
- Calcula métricas reais de domínio e progresso
- Prioriza revisão baseada em algoritmo inteligente

### 2. **Priorização Inteligente**

O sistema calcula um **score de prioridade** para cada tópico baseado em:

```typescript
priorityScore = 
  (100 - masteryLevel) * 0.5 +        // Baixo domínio = alta prioridade
  min(daysSinceReview * 10, 100) +    // Tempo desde última revisão
  min(practiceCount * 5, 50)          // Quantidade de prática
```

**Fatores considerados:**
- 📉 Nível de domínio atual (0-100%)
- 📅 Dias desde última revisão
- 🔄 Número de práticas realizadas
- ✅ Taxa de acertos (accuracy)

### 3. **Sugestões Personalizadas com Claude**

O Claude analisa o perfil completo e gera sugestões ESPECÍFICAS:

```
ENTRADA PARA CLAUDE:
- Perfil: Nome, idade, classe, interesses
- Conversas: Total, assuntos estudados
- Progresso: Tópicos praticados, níveis de domínio
```

```
SAÍDA DO CLAUDE:
[
  "Revê equações do 2º grau usando exemplos de futebol (teu interesse)",
  "Pratica mais física - domínio atual: 65%",
  "Foca em química antes do exame (objetivo mencionado)",
  ...
]
```

### 4. **Sistema de Revisão Espaçada**

Recomendações automáticas baseadas em domínio e tempo:

| Domínio | Dias desde revisão | Recomendação |
|---------|-------------------|--------------|
| ≥ 90% | < 7 dias | "Daqui a 1 semana" |
| ≥ 75% | < 3 dias | "Daqui a 3 dias" |
| < 75% | Qualquer | "Hoje" ou "Amanhã" |
| < 60% | > 3 dias | "Hoje (Urgente!)" |

## 🔧 Implementação Técnica

### Backend Endpoints

#### 1. `revision.getReviewTopics`

**Responsabilidade:** Buscar tópicos para revisão baseados em histórico real

```typescript
Input: { limit: number } // Default: 20

Output: {
  topics: Array<{
    subject: string;
    topic: string;
    masteryLevel: number;        // 0-100
    practiceCount: number;        // Quantas vezes praticou
    lastReviewedAt: Date | null;
    daysSinceReview: number;
    priorityScore: number;        // Score de prioridade
    nextReview: string;           // "Hoje", "Amanhã", etc
    accuracy: number;             // % de acertos
    conversationIds: number[];    // IDs das conversas relacionadas
  }>;
  hasConversations: boolean;
  totalTopics: number;
  profileInterests: string[];
}
```

**Lógica:**

1. Busca todas as conversas do usuário (até 100)
2. Se não houver conversas, retorna mensagem motivadora
3. Busca dados da tabela `learningProgress`
4. Extrai tópicos únicos das conversas (subject/topic)
5. Merge dados de conversas + progress
6. Calcula score de prioridade
7. Ordena por prioridade (decrescente)
8. Retorna top N tópicos

#### 2. `revision.getSmartSuggestions`

**Responsabilidade:** Gerar sugestões personalizadas com Claude

```typescript
Output: {
  suggestions: string[];  // 4-6 sugestões práticas
  hasData: boolean;       // Se tem dados suficientes
  generatedAt?: Date;
}
```

**Fluxo:**

1. Busca perfil + conversas + progresso
2. Se não há conversas, retorna sugestões básicas
3. Constrói contexto compacto para Claude
4. Chama Claude com prompt especializado
5. Parseia resposta JSON
6. Retorna sugestões ou fallback em caso de erro

**Prompt para Claude:**
```
Gera 4-6 sugestões PRÁTICAS de revisão baseadas no histórico.
- ACIONÁVEIS (ex: "Revê X fazendo Y")
- Conecta com INTERESSES
- Foca em assuntos JÁ ESTUDADOS
- Considera DIFICULDADES
- Usa técnicas comprovadas
Formato: JSON array
```

#### 3. `revision.startReviewSession`

**Responsabilidade:** Iniciar sessão de revisão para um tópico específico

```typescript
Input: { 
  subject: string;
  topic: string;
}

Output: {
  conversationId: number;
}
```

**Ações:**

1. Cria nova conversa com `mode: "revision"`
2. Define `subject` e `topic` na conversa
3. Atualiza `learningProgress` marcando como sendo revisado
4. Retorna ID da conversa para redirecionamento

### Frontend (Revision.tsx)

#### Queries tRPC:

```typescript
// Buscar tópicos de revisão
const reviewTopicsQuery = trpc.revision.getReviewTopics.useQuery({ limit: 20 });

// Buscar sugestões do Claude
const smartSuggestionsQuery = trpc.revision.getSmartSuggestions.useQuery();

// Iniciar sessão de revisão
const startReviewMutation = trpc.revision.startReviewSession.useMutation({
  onSuccess: () => setLocation("/chat"),
});
```

#### Estados da Página:

**1. Sem Conversas (Novo Usuário):**
```tsx
<div>
  <BookOpen icon />
  <h3>Ainda não tens conversas</h3>
  <p>A revisão funciona melhor quando já tens um histórico...</p>
  <Button>Começar a Estudar Agora</Button>
</div>
```

**2. Carregando:**
```tsx
<div>
  <Spinner />
  <p>A carregar tópicos de revisão...</p>
</div>
```

**3. Com Tópicos:**
```tsx
{/* Sugestões do Claude */}
<Card className="gradient purple">
  {suggestions.map(s => <div>{s}</div>)}
</Card>

{/* Grid de Tópicos */}
<div className="grid">
  {topics.map(topic => (
    <TopicCard
      subject={topic.subject}
      topic={topic.topic}
      masteryLevel={topic.masteryLevel}
      lastReviewed={...}
      nextReview={topic.nextReview}
      accuracy={topic.accuracy}
      onClick={() => startReview(topic)}
    />
  ))}
</div>
```

#### Card de Tópico:

**Informações Exibidas:**
- ✅ Assunto (ex: "Matemática")
- ✅ Tópico (ex: "Equações do 2º grau")
- ✅ Nível de domínio com cor (verde ≥80%, amarelo ≥60%, vermelho <60%)
- ✅ Última revisão ("Há 2 dias", "Ontem", "Há 1 semana")
- ✅ Próxima revisão recomendada ("Hoje", "Amanhã", "Daqui a 3 dias")
- ✅ Número de práticas realizadas
- ✅ Taxa de acerto (se disponível)
- ✅ Botão "Rever Agora" ou "Praticar Mais" (condicional)

**Cores de Domínio:**
```typescript
getMasteryColor(level: number) {
  if (level >= 80) return "green";   // Bom domínio
  if (level >= 60) return "yellow";  // Médio
  return "red";                      // Precisa praticar
}
```

## 📊 Integração com Banco de Dados

### Tabela: `learningProgress`

```sql
CREATE TABLE learningProgress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  profileId INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  masteryLevel INT DEFAULT 0,        -- 0-100
  practiceCount INT DEFAULT 0,
  correctAnswers INT DEFAULT 0,
  totalAnswers INT DEFAULT 0,
  lastReviewedAt TIMESTAMP,
  nextReviewAt TIMESTAMP,            -- Para revisão espaçada
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Atualização Automática:

Quando o usuário **envia uma mensagem no chat**:

```typescript
// server/db.ts - addMessage()
if (role === "user" && conv.subject && conv.topic) {
  await updateLearningProgress({
    profileId: conv.profileId,
    subject: conv.subject,
    topic: conv.topic,
    totalAnswers: 1,  // Incrementa contador
  });
}
```

Quando o usuário **inicia uma revisão**:

```typescript
// Marca como sendo revisado agora
await updateLearningProgress({
  profileId: profile.id,
  subject: input.subject,
  topic: input.topic,
  // lastReviewedAt é atualizado automaticamente
});
```

## 🎨 UI/UX Design

### Layout da Página:

```
┌─────────────────────────────────────────────┐
│ HEADER (Logo + Nav)                         │
├─────────────────────────────────────────────┤
│                                             │
│ 📚 Revisão Inteligente          [20 tópicos]│
│ Revê e domina os tópicos que já estudaste   │
│                                             │
├─────────────────────────────────────────────┤
│ 💡 SUGESTÕES PERSONALIZADAS (Claude)        │
│ ┌──────────────┐ ┌──────────────┐          │
│ │ Sugestão 1   │ │ Sugestão 2   │          │
│ └──────────────┘ └──────────────┘          │
├─────────────────────────────────────────────┤
│ 🔍 [Pesquisar matéria ou tópico...]        │
├─────────────────────────────────────────────┤
│ TÓPICOS PARA REVER (Grid 3 colunas)        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │Matemática│ │  Física  │ │ Química  │    │
│ │ 85% 🟢  │ │  65% 🟡  │ │  45% 🔴  │    │
│ │Equações..│ │Leis de..│ │Tabela... │    │
│ │[Rever]   │ │[Praticar]│ │[Urgente!]│    │
│ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘
```

### Cores e Gradientes:

**Sugestões do Claude:**
- Gradiente: `from-purple-50 to-pink-50`
- Borda: `border-purple-200`
- Texto: `text-purple-900`
- Ícones: `text-purple-600`

**Cards de Tópicos:**
- Verde (≥80%): `bg-green-50 border-green-200 text-green-600`
- Amarelo (≥60%): `bg-yellow-50 border-yellow-200 text-yellow-600`
- Vermelho (<60%): `bg-red-50 border-red-200 text-red-600`
- Hover: `hover:shadow-lg hover:scale-105`

## 🚀 Fluxo Completo de Uso

### Cenário 1: Usuário Novo (Sem Conversas)

```
1. Usuário acessa /revision
2. Backend verifica: conversations.length === 0
3. Retorna: { hasConversations: false, message: "..." }
4. Frontend exibe estado vazio com CTA
5. Usuário clica "Começar a Estudar"
6. Redireciona para /chat
```

### Cenário 2: Usuário com Histórico

```
1. Usuário acessa /revision
2. Backend busca:
   - Conversas (100 últimas)
   - learningProgress
3. Processa:
   - Extrai tópicos únicos
   - Calcula scores de prioridade
   - Ordena por urgência
4. Claude gera sugestões personalizadas
5. Frontend exibe:
   - Sugestões do Claude (top)
   - Tópicos priorizados (grid)
6. Usuário clica em um tópico
7. startReviewMutation cria nova conversa
8. Redireciona para /chat com contexto
```

### Cenário 3: Revisão em Andamento

```
1. No /chat, sistema detecta mode: "revision"
2. Prompt do LLM incluido:
   "SESSÃO DE REVISÃO ativa"
   "Assunto: {subject}"
   "Tópico: {topic}"
   "Foca em testar conhecimento com perguntas"
3. Durante a conversa:
   - Cada resposta do usuário incrementa practiceCount
   - Sistema pode avaliar correctness
   - Atualiza masteryLevel conforme performance
```

## 📈 Métricas e Analytics

### Dados Rastreados:

- **Por Tópico:**
  - masteryLevel (0-100%)
  - practiceCount (número)
  - correctAnswers / totalAnswers
  - lastReviewedAt (timestamp)
  - daysSinceReview (calculado)

- **Por Usuário:**
  - Total de tópicos estudados
  - Média de domínio (avg masteryLevel)
  - Tópicos com baixo domínio (<60%)
  - Tópicos não revisados há > 7 dias

### Potenciais Dashboards:

```typescript
// Exemplo de análise
const userStats = {
  totalTopics: 15,
  avgMastery: 73,
  needsReview: 5,        // < 70% ou > 7 dias
  wellMastered: 8,       // ≥ 80%
  strugglingWith: ["Química", "Biologia"],
};
```

## 🔮 Melhorias Futuras

### 1. **Gamificação**
- 🏆 Badges por domínio de tópicos
- 🔥 Streaks de revisão diária
- 📊 Leaderboard (opcional, anonimizado)

### 2. **Notificações**
- 📬 Email/WhatsApp: "Tempo de rever Matemática!"
- 🔔 Alertas para tópicos não revisados há > 14 dias

### 3. **Revisão Adaptativa**
- 🧠 Ajustar dificuldade baseado em performance
- 📝 Gerar quizzes personalizados
- 🎯 Focar automaticamente em pontos fracos

### 4. **Integração com Exames**
- 📅 Plano de revisão para data de exame
- 📚 Priorizar tópicos que caem no exame
- ⏱️ Simulados cronometrados

### 5. **Revisão Colaborativa**
- 👥 Estudar com amigos (family plan)
- 💬 Discussões em grupo sobre tópicos
- 🤝 Peer teaching (ensinar = melhor retenção)

## 🧪 Testes Recomendados

### Teste 1: Usuário Novo
```
1. Criar conta nova
2. Completar onboarding
3. Acessar /revision
4. Verificar mensagem motivadora
5. Clicar "Começar a Estudar"
```

### Teste 2: Criação de Histórico
```
1. Fazer 5-10 conversas variadas
2. Cobrir 3+ assuntos diferentes
3. Acessar /revision
4. Verificar tópicos aparecem
5. Verificar sugestões do Claude
```

### Teste 3: Iniciar Revisão
```
1. Na página /revision
2. Clicar em um tópico
3. Verificar redirecionamento para /chat
4. Verificar mode: "revision" ativo
5. Fazer perguntas sobre o tópico
6. Voltar a /revision
7. Verificar lastReviewedAt atualizado
```

### Teste 4: Filtros e Busca
```
1. Ter 10+ tópicos
2. Testar busca por assunto
3. Testar busca por tópico
4. Verificar filtro funciona
5. Limpar busca
```

## 📚 Recursos Relacionados

- `server/routers.ts` - Endpoints revision.*
- `client/src/pages/Revision.tsx` - Interface
- `server/db.ts` - updateLearningProgress()
- `drizzle/schema.ts` - Tabela learningProgress
- `HISTORICO_PERSONALIZADO.md` - Dashboard features

## 💡 Dicas para Desenvolvedores

1. **Sempre use dados reais** - Nunca mockar tópicos de revisão
2. **Priorize performance** - Cache queries de tópicos (1-5 min)
3. **Graceful degradation** - Se Claude falhar, use fallback
4. **Mobile-first** - Grid responsivo (1 col → 2 col → 3 col)
5. **Feedback visual** - Loading states, empty states, success toasts

---

**Desenvolvido com ❤️ para estudantes moçambicanos**

*Última atualização: 9 de Dezembro de 2025*
