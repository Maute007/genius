# 🎓 Genius - Plataforma Educacional com IA

![Genius Logo](client/public/genius-logo.png)

> **Deixa de decorar. Começa a dominar.**

Plataforma educacional inteligente que personaliza o ensino para estudantes moçambicanos, combinando IA de ponta com conhecimento local.

---

## 🌟 Visão Geral

O **Genius** é a primeira plataforma educacional com IA desenhada especificamente para o contexto moçambicano. Usa tecnologia de ponta (Claude/GPT) combinada com um sistema RAG que integra 85 PDFs educacionais moçambicanos (18.769 chunks de conhecimento).

### Filosofia

**"Conhecimento Global + Contexto Local = Moçambicanos Competitivos Globalmente"**

O Genius não limita os estudantes aos manuais locais. Usa o melhor conhecimento mundial, adaptado ao contexto moçambicano, para formar mentes brilhantes.

---

## ✨ Funcionalidades Principais

### 🤖 IA Personalizada
- Ensina de verdade (não apenas responde)
- Metodologia "Ensinar, não responder"
- 5 passos pedagógicos
- Adaptação ao perfil do estudante

### 📚 Sistema RAG Híbrido
- 85 PDFs moçambicanos processados
- 18.769 chunks de conhecimento
- Livros: 8ª, 9ª, 10ª, 11ª, 12ª classes
- Exames: 12ª classe, UEM, UP
- Busca semântica inteligente

### 🎯 4 Modos de Estudo
1. **Dúvida Rápida** - Resposta focada e direta
2. **Preparação para Exame** - Estudo profundo com exames anteriores
3. **Revisão** - Rever tópicos já estudados
4. **Aprendizagem Livre** - Explorar novos conceitos

### 👤 Onboarding Completo
- Perfil personalizado (idade, interesses, escola)
- Captura de leads (email, WhatsApp)
- Suporte para autodidatas e não estudantes
- 4 passos de configuração

### 💬 Chat Inteligente
- Interface moderna e responsiva
- Sidebar com histórico de conversas
- Títulos automáticos gerados pela IA
- Edição manual de títulos
- Markdown rendering
- Mobile-friendly

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 22+
- pnpm
- MySQL 8+ ou TiDB

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar .env (ver INSTALACAO.md)
cp .env.example .env

# Executar migrações
pnpm db:push

# Iniciar desenvolvimento
pnpm dev
```

**Abrir:** http://localhost:3000

---

## 📚 Documentação

- **[INSTALACAO.md](INSTALACAO.md)** - Guia completo de instalação e deploy
- **[DOCUMENTACAO_TECNICA.md](DOCUMENTACAO_TECNICA.md)** - Arquitetura, APIs, fluxos
- **[todo.md](todo.md)** - Funcionalidades implementadas e pendentes

---

## 🏗️ Stack Tecnológica

### Frontend
- React 19 + TypeScript
- TailwindCSS 4 + shadcn/ui
- tRPC 11 (type-safe API)
- Wouter (routing)
- React Query (cache)

### Backend
- Node.js + Express 4
- tRPC 11
- MySQL/TiDB + Drizzle ORM
- JWT (authentication)
- bcrypt (password hashing)

### IA
- **Claude 3.5 Sonnet** (API Anthropic) - Modelo principal
- Fallback: GPT-4o / Gemini
- ChromaDB (vector database)
- HuggingFace Embeddings
- LangChain (RAG)

> 📖 Ver [CONFIGURACAO_CLAUDE_API.md](CONFIGURACAO_CLAUDE_API.md) para configurar a API do Claude

---

## 📊 Base de Dados

### Principais Tabelas

- **users** - Utilizadores e autenticação
- **profiles** - Perfis detalhados dos estudantes
- **conversations** - Histórico de conversas
- **messages** - Mensagens do chat
- **schools** - Escolas moçambicanas
- **subscriptions** - Planos e pagamentos

Ver schema completo em `drizzle/schema.ts`

---

## 🎨 Design

### Paleta de Cores
- **Primary:** Turquesa #00D9C0
- **Background:** Branco #FFFFFF
- **Foreground:** Preto #171717

### Tipografia
- **Títulos:** Playfair Display (serif)
- **Corpo:** Inter (sans-serif)
- **Chat:** Crimson Text (serif elegante)

---

## 🔐 Autenticação

### Sistema Atual
- Email + Password
- JWT tokens (localStorage)
- Sessão de 30 dias

### Fluxos

**Registro:**
```
/register → Auto-login → /onboarding (4 passos) → /landing → /chat
```

**Login:**
```
/login → Email + Password → /landing → /chat
```

---

## 📈 Planos

### Individual (B2C)
- **Gratuito** - 100 perguntas/mês, 1 modo
- **Estudante** - 500 MZN/mês, ilimitado, 2 modos
- **Estudante+** - 1.000 MZN/mês, ilimitado, 4 modos
- **Família** - 2.000 MZN/mês, 2 estudantes, 4 modos

### Escolas (B2B)
- Proposta personalizada
- Dashboard institucional
- Relatórios de progresso
- Suporte dedicado

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Dev server
pnpm build            # Build produção
pnpm start            # Iniciar produção

# Base de dados
pnpm db:push          # Aplicar schema
pnpm db:studio        # Drizzle Studio (GUI)

# Qualidade
pnpm lint             # ESLint
pnpm test             # Testes
```

---

## 📦 Deploy

### Vercel + Railway (Recomendado)
```bash
# Frontend (Vercel)
vercel deploy --prod

# Backend (Railway)
railway up
```

### Docker
```bash
docker build -t genius .
docker run -p 3000:3000 --env-file .env genius
```

Ver guia completo em **[INSTALACAO.md](INSTALACAO.md)**

---

## 🐛 Issues Conhecidos

### Urgente
- [ ] Sessão persiste por 30 dias (deve expirar ao fechar browser)
- [ ] Sem controlo de inatividade (deve logout após 1 hora)
- [ ] localStorage não é seguro (migrar para httpOnly cookies)

### Funcionalidades Pendentes
- [ ] Dashboard do estudante
- [ ] Sistema de pagamentos (M-Pesa, E-Mola)
- [ ] Dashboard dos pais
- [ ] CRM para escolas
- [ ] Simulados personalizados

Ver lista completa em **[todo.md](todo.md)**

---

## 📞 Contactos

**Empresa:** Rise Tech IA & Bravantic  
**Email:** genius@risetech.co.mz  
**Telefone:** +258 826 074 507  
**Fundador:** Donald Dimas

---

## 📄 Licença

© 2025 Rise Tech IA & Bravantic. Todos os direitos reservados.

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ para os estudantes moçambicanos.

> "A verdadeira educação começa quando paramos de comparar e começamos a compreender."  
> — Donald Dimas, Fundador do Genius

---

**Versão:** 1.1  
**Última atualização:** 29 de Outubro de 2025

