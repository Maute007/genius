# Genius - Documentação Técnica Completa

## 📋 Visão Geral

**Genius** é uma plataforma educacional com IA para estudantes moçambicanos. Combina conhecimento global com contexto local através de um sistema RAG (Retrieval-Augmented Generation) que integra 85 PDFs educacionais moçambicanos.

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica

**Frontend:**
- React 19 + TypeScript
- TailwindCSS 4 + shadcn/ui
- tRPC 11 (type-safe API)
- Wouter (routing)
- React Query (cache)

**Backend:**
- Node.js + Express 4
- tRPC 11 (API layer)
- MySQL/TiDB (database)
- Drizzle ORM
- JWT (authentication)

**IA e RAG:**
- Claude 3.5 Sonnet / GPT-4o (LLM)
- ChromaDB (vector database)
- HuggingFace Embeddings (multilíngue)
- LangChain (RAG orchestration)
- 18.769 chunks de conhecimento indexados

**Infraestrutura:**
- Manus Platform (atual)
- Vercel/Railway (migração planejada)
- S3-compatible storage

---

## 📁 Estrutura de Diretórios

```
genius/
├── client/                    # Frontend React
│   ├── public/               # Assets estáticos
│   │   └── genius-logo.png   # Logo oficial
│   ├── src/
│   │   ├── _core/            # Core do sistema
│   │   │   └── hooks/
│   │   │       └── useGeniusAuth.ts  # Hook de autenticação
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── contexts/         # React contexts
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/
│   │   │   └── trpc.ts      # Cliente tRPC
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── Home.tsx     # Landing page
│   │   │   ├── Login.tsx    # Login (email + password)
│   │   │   ├── Register.tsx # Registro
│   │   │   ├── Onboarding.tsx  # 4 passos de onboarding
│   │   │   ├── Chat.tsx     # Interface de chat principal
│   │   │   ├── Planos.tsx   # Página de planos
│   │   │   ├── ParaEscolas.tsx
│   │   │   ├── SobreNos.tsx
│   │   │   └── Contactos.tsx
│   │   ├── App.tsx          # Rotas principais
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Estilos globais
│   └── index.html
│
├── server/                    # Backend Node.js
│   ├── _core/                # Core do framework
│   │   ├── context.ts       # tRPC context
│   │   ├── trpc.ts          # tRPC setup
│   │   ├── llm.ts           # LLM integration
│   │   ├── cookies.ts       # Session management
│   │   └── env.ts           # Environment variables
│   ├── knowledge_base/       # ChromaDB vector store
│   │   └── chroma.sqlite3   # Base vetorial
│   ├── auth-router.ts        # Autenticação (login/register)
│   ├── routers.ts            # tRPC routers principais
│   ├── db.ts                 # Database helpers
│   └── rag.ts                # Sistema RAG
│
├── drizzle/                   # Database
│   └── schema.ts             # Schema completo (11 tabelas)
│
├── shared/                    # Código compartilhado
│   └── const.ts              # Constantes
│
└── documents/                 # Material educacional
    └── mocambique/           # 85 PDFs processados
        └── (livros e exames por classe)

```

---

## 🗄️ Schema da Base de Dados

### Tabela: `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  password TEXT,                    -- Hash bcrypt
  emailVerified BOOLEAN DEFAULT TRUE,
  verificationToken VARCHAR(255),
  loginMethod VARCHAR(64),          -- "password" ou "oauth"
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  lastSignedIn TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `profiles`
```sql
CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  whatsapp VARCHAR(20),
  age INT NOT NULL,
  grade VARCHAR(50) NOT NULL,
  interests JSON,                   -- Array de strings
  otherInterests TEXT,
  learningStyle VARCHAR(100),
  learningPreferences JSON,         -- Array de strings
  challenges TEXT,
  studyGoals TEXT,
  schoolName VARCHAR(255),
  schoolType ENUM(...),
  province VARCHAR(100),
  city VARCHAR(100),
  onboardingCompleted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Tabela: `conversations`
```sql
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255),               -- Título gerado pela IA
  mode VARCHAR(50) NOT NULL,        -- quick_doubt, exam_prep, etc
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Tabela: `messages`
```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversationId INT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (conversationId) REFERENCES conversations(id)
);
```

### Tabela: `schools`
```sql
CREATE TABLE schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  normalizedName VARCHAR(255) NOT NULL UNIQUE,
  type ENUM('public_school', 'private_school', ...),
  province VARCHAR(100),
  city VARCHAR(100),
  studentCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `subscriptions`
```sql
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  plan ENUM('free', 'student', 'student_plus', 'family'),
  status ENUM('active', 'cancelled', 'expired'),
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

**Outras tabelas:** `school_leads`, `question_usage`, `payments`, `family_members`, `admin_logs`

---

## 🔐 Autenticação

### Sistema Atual

**Método:** JWT tokens armazenados no `localStorage`

**Fluxo de Registro:**
1. Utilizador preenche formulário (nome, email, password)
2. Backend cria user com password hash (bcrypt)
3. Gera JWT token (30 dias de validade)
4. Frontend salva token e user no localStorage
5. Redireciona para onboarding (4 passos)
6. Após onboarding, vai para landing page

**Fluxo de Login:**
1. Utilizador insere email + password
2. Backend verifica credenciais
3. Gera JWT token
4. Frontend salva no localStorage
5. Redireciona para landing page (não passa por onboarding)

**Hooks:**
- `useGeniusAuth()` - Hook principal de autenticação
- Retorna: `{ user, loading, isAuthenticated, logout }`

### ⚠️ Problemas Conhecidos

1. **Sessão persiste por 30 dias** - Deve expirar ao fechar browser
2. **Sem controlo de inatividade** - Deve fazer logout após 1 hora
3. **localStorage não é seguro** - Migrar para httpOnly cookies

### 🔧 Correções Necessárias

```typescript
// Usar sessionStorage em vez de localStorage
sessionStorage.setItem("genius_token", token);

// Implementar controlo de inatividade
useEffect(() => {
  let timeout: NodeJS.Timeout;
  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      logout(); // Logout após 1 hora
    }, 60 * 60 * 1000);
  };
  
  window.addEventListener('mousemove', resetTimeout);
  window.addEventListener('keypress', resetTimeout);
  
  resetTimeout();
  
  return () => {
    clearTimeout(timeout);
    window.removeEventListener('mousemove', resetTimeout);
    window.removeEventListener('keypress', resetTimeout);
  };
}, []);
```

---

## 🤖 Sistema RAG (Conhecimento Moçambicano)

### Visão Geral

O Genius usa um sistema RAG híbrido que combina:
- **Conhecimento global** (LLM base - Claude/GPT)
- **Contexto local** (85 PDFs moçambicanos indexados)

### Material Processado

**Total:** 85 PDFs, 1.85 GB, 18.769 chunks

**Por Classe:**
- 8ª Classe: 10 documentos
- 9ª Classe: 10 documentos
- 10ª Classe: 9 documentos
- 11ª Classe: 7 documentos
- 12ª Classe: 23 documentos
- Admissão UEM: 14 documentos
- Admissão UP: 11 documentos

**Disciplinas:** Matemática, Física, Química, Biologia, Português, Inglês, Francês, Filosofia, Geografia, História, Desenho, Ed. Visual, Agropecuária

### Arquitetura RAG

```
Pergunta do Estudante
        ↓
Detecção de Relevância (shouldSearchMaterial)
        ↓
[SIM] → Busca Semântica (ChromaDB)
        ↓
Retrieval de Chunks Relevantes (top 5)
        ↓
Contexto Adicionado ao System Prompt
        ↓
LLM Gera Resposta (conhecimento global + contexto local)
        ↓
[NÃO] → LLM usa apenas conhecimento global
```

### Código Principal

**Arquivo:** `/server/rag.ts`

```typescript
// Detecta quando buscar material
export function shouldSearchMaterial(query: string, mode: string): boolean {
  if (mode === "exam_prep") return true;
  
  const keywords = [
    "manual", "livro", "exame", "admissão", "uem", "up",
    "currículo", "programa", "matéria", "tópico"
  ];
  
  return keywords.some(k => query.toLowerCase().includes(k));
}

// Busca semântica
export async function searchKnowledgeBase(query: string, topK = 5) {
  const collection = await getCollection();
  const results = await collection.query({
    queryTexts: [query],
    nResults: topK,
  });
  return results;
}
```

### Base Vetorial

**Localização:** `/server/knowledge_base/`
**Formato:** ChromaDB (SQLite + vetores)
**Embeddings:** HuggingFace multilíngue (português)

---

## 🎨 Design System

### Paleta de Cores

```css
/* Cores principais */
--primary: 174 100% 50%;        /* Turquesa #00D9C0 */
--primary-foreground: 0 0% 100%;

/* Cores de fundo */
--background: 0 0% 100%;        /* Branco */
--foreground: 0 0% 9%;          /* Preto #171717 */

/* Cores secundárias */
--card: 0 0% 100%;
--card-foreground: 0 0% 9%;
--muted: 0 0% 96%;
--muted-foreground: 0 0% 45%;
```

### Tipografia

```css
/* Títulos */
font-family: 'Playfair Display', serif;

/* Corpo */
font-family: 'Inter', sans-serif;

/* Chat (mensagens IA) */
font-family: 'Crimson Text', serif;
```

### Componentes

**Biblioteca:** shadcn/ui (Radix UI + TailwindCSS)

**Principais:**
- Button, Input, Label, Card
- Dialog, Sheet, Dropdown
- Toast (sonner)

---

## 🚀 Instalação e Deploy

### Requisitos

- Node.js 22+
- MySQL 8+ ou TiDB
- pnpm (package manager)

### Instalação Local

```bash
# Clone o repositório
cd genius

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar migrações
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/genius

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# LLM (Claude ou OpenAI)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# App Config
VITE_APP_TITLE=Genius
VITE_APP_LOGO=/genius-logo.png

# Email (se implementar verificação)
RESEND_API_KEY=re_...

# Storage (S3-compatible)
S3_ENDPOINT=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=genius-files
```

### Deploy em Produção

**Opção 1: Vercel (Frontend) + Railway (Backend)**

```bash
# Frontend (Vercel)
vercel deploy

# Backend (Railway)
railway up
```

**Opção 2: VPS (DigitalOcean, AWS, etc)**

```bash
# Build
pnpm build

# Iniciar com PM2
pm2 start ecosystem.config.js
```

---

## 📊 Fluxos Principais

### 1. Fluxo de Registro

```
/register
  ↓
Preenche formulário (nome, email, password)
  ↓
Backend: cria user + gera JWT
  ↓
Frontend: salva token no localStorage
  ↓
/onboarding (4 passos)
  ↓
Passo 1: Dados pessoais + email + WhatsApp
  ↓
Passo 2: Interesses + métodos de aprendizagem
  ↓
Passo 3: Objetivos + desafios
  ↓
Passo 4: Escola (ou autodidata/não estudante)
  ↓
Backend: cria profile
  ↓
/landing
  ↓
Utilizador clica "Abrir Chat"
  ↓
/chat
```

### 2. Fluxo de Login

```
/login
  ↓
Insere email + password
  ↓
Backend: verifica credenciais + gera JWT
  ↓
Frontend: salva token
  ↓
/landing (NÃO passa por onboarding)
  ↓
Utilizador clica "Abrir Chat"
  ↓
/chat
```

### 3. Fluxo de Chat

```
/chat
  ↓
Utilizador seleciona modo (quick_doubt, exam_prep, etc)
  ↓
Escreve pergunta
  ↓
Backend: verifica se deve buscar RAG
  ↓
[SIM] → Busca chunks relevantes no ChromaDB
  ↓
Adiciona contexto ao system prompt
  ↓
[NÃO] → Usa apenas conhecimento global
  ↓
LLM gera resposta personalizada
  ↓
Primeira mensagem → IA gera título da conversa
  ↓
Frontend: renderiza resposta com Markdown
  ↓
Conversa continua...
```

---

## 🔧 APIs Principais

### tRPC Routers

**auth (Autenticação)**
```typescript
auth.register({ name, email, password })
auth.login({ identifier, password })
auth.logout()
auth.me() // Retorna user atual
```

**profile (Perfil)**
```typescript
profile.get() // Retorna profile do user
profile.upsert({ fullName, age, grade, ... }) // Onboarding
profile.searchSchools({ query }) // Autocomplete escolas
```

**chat (Conversas)**
```typescript
chat.sendMessage({ conversationId?, mode, message })
chat.getActive() // Conversa ativa
chat.listConversations() // Todas as conversas
chat.createConversation({ mode })
chat.updateTitle({ conversationId, title })
```

---

## 📝 Tarefas Pendentes

### Urgente (Bugs)

- [ ] **Sessão expira ao fechar browser** (usar sessionStorage)
- [ ] **Logout após 1 hora de inatividade**
- [ ] **Migrar de localStorage para httpOnly cookies**

### Funcionalidades Faltantes

- [ ] Dashboard do estudante (progresso, histórico)
- [ ] Dashboard dos pais (plano Família)
- [ ] Sistema de pagamentos (M-Pesa, E-Mola, Mkesh)
- [ ] Simulados personalizados
- [ ] Sistema de conquistas/badges
- [ ] Relatórios semanais por email
- [ ] CRM para leads escolares (B2B)

### Melhorias de Performance

- [ ] Cache de perfis (Redis)
- [ ] Lazy loading de conversas
- [ ] Otimização de queries RAG
- [ ] Compressão de respostas

### SEO e Marketing

- [ ] Meta tags otimizadas
- [ ] Sitemap XML
- [ ] Google Analytics
- [ ] Facebook Pixel

---

## 📞 Contactos

**Empresa:** Rise Tech IA & Bravantic  
**Email:** genius@risetech.co.mz  
**Telefone:** +258 826 074 507  
**Fundador:** Donald Dimas  

---

## 📄 Licença

Propriedade de Rise Tech IA & Bravantic. Todos os direitos reservados.

---

**Última atualização:** 29 de Outubro de 2025  
**Versão:** 1.1 - Documentação Técnica Completa

