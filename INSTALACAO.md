# Genius - Guia de Instalação Rápida

## 📦 Pré-requisitos

- **Node.js** 22+ ([Download](https://nodejs.org/))
- **pnpm** ([Instalação](https://pnpm.io/installation))
- **MySQL** 8+ ou **TiDB** ([MySQL Download](https://dev.mysql.com/downloads/))
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Instalação Local (Desenvolvimento)

### 1. Extrair o Código

```bash
# Extrair o ZIP
unzip genius-codigo-completo.zip
cd genius
```

### 2. Instalar Dependências

```bash
# Instalar pnpm (se ainda não tiver)
npm install -g pnpm

# Instalar dependências do projeto
pnpm install
```

### 3. Configurar Base de Dados

```bash
# Criar base de dados MySQL
mysql -u root -p
CREATE DATABASE genius CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. Configurar Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL=mysql://root:password@localhost:3306/genius

# ============================================
# JWT SECRET (Gerar um aleatório)
# ============================================
JWT_SECRET=mude-isto-para-algo-super-secreto-e-aleatorio

# ============================================
# LLM - API do Claude (Recomendado)
# ============================================
# Ver CONFIGURACAO_CLAUDE_API.md para detalhes
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_API_VERSION=2023-06-01

# ============================================
# LLM - Fallback (Opcional)
# ============================================
# Usado apenas se CLAUDE_API_KEY não estiver definida
# Opção 1: OpenAI (GPT)
# BUILT_IN_FORGE_API_KEY=sk-...
# BUILT_IN_FORGE_API_URL=https://api.openai.com

# Opção 2: Forge API
# BUILT_IN_FORGE_API_KEY=...
# BUILT_IN_FORGE_API_URL=https://forge.manus.im

# ============================================
# APP CONFIG
# ============================================
VITE_APP_TITLE=Genius
VITE_APP_LOGO=/genius-logo.png
NODE_ENV=development

# ============================================
# STORAGE (S3) - Opcional
# ============================================
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=genius-files
S3_REGION=us-east-1

# ============================================
# EMAIL (Resend) - Opcional
# ============================================
RESEND_API_KEY=re_...
```

**Como obter as chaves:**

- **Claude API:** https://console.anthropic.com/
- **OpenAI API:** https://platform.openai.com/api-keys
- **Resend (Email):** https://resend.com/api-keys

### 5. Executar Migrações

```bash
# Criar tabelas na base de dados
pnpm db:push
```

### 6. Iniciar Servidor de Desenvolvimento

```bash
# Iniciar frontend + backend
pnpm dev
```

Abrir no browser: **http://localhost:3000**

---

## 🌐 Deploy em Produção

### Opção 1: Vercel + Railway

**Frontend (Vercel):**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod
```

**Backend (Railway):**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Opção 2: VPS (DigitalOcean, AWS, Linode)

```bash
# Build do projeto
pnpm build

# Instalar PM2
npm install -g pm2

# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'genius',
    script: 'server/_core/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Opção 3: Docker

```bash
# Criar Dockerfile
cat > Dockerfile << 'EOF'
FROM node:22-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
EOF

# Build e run
docker build -t genius .
docker run -p 3000:3000 --env-file .env genius
```

---

## 🗄️ Base de Dados em Produção

### TiDB Cloud (Recomendado - Grátis)

1. Criar conta em https://tidbcloud.com/
2. Criar cluster grátis
3. Copiar connection string
4. Atualizar `DATABASE_URL` no `.env`

### PlanetScale (MySQL Serverless)

1. Criar conta em https://planetscale.com/
2. Criar database
3. Copiar connection string
4. Atualizar `DATABASE_URL` no `.env`

### MySQL Tradicional

Qualquer provider de MySQL 8+ funciona:
- AWS RDS
- DigitalOcean Managed Database
- Google Cloud SQL
- Azure Database for MySQL

---

## 📊 Sistema RAG (Conhecimento Moçambicano)

### Base Vetorial Já Processada

A base vetorial com 18.769 chunks já está incluída em:
```
server/knowledge_base/
├── chroma.sqlite3
└── (outros arquivos ChromaDB)
```

**Não é necessário reprocessar os PDFs!**

### Se Precisar Reprocessar

```bash
# Instalar dependências Python
pip install langchain chromadb pypdf sentence-transformers

# Processar PDFs (script em Python)
python process_pdfs.py
```

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Iniciar dev server
pnpm build            # Build para produção
pnpm start            # Iniciar produção

# Base de dados
pnpm db:push          # Aplicar schema
pnpm db:studio        # Abrir Drizzle Studio (GUI)

# Testes
pnpm test             # Executar testes
pnpm lint             # Verificar código

# Limpeza
pnpm clean            # Limpar build
rm -rf node_modules   # Limpar dependências
pnpm install          # Reinstalar
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar connection string no .env
# Formato: mysql://user:password@host:port/database
```

### Erro: "Module not found"

```bash
# Reinstalar dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "Port 3000 already in use"

```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou mudar porta no .env
PORT=3001
```

### Erro: "LLM API key invalid"

Verificar se a chave está correta no `.env`:
- Claude: `ANTHROPIC_API_KEY`
- OpenAI: `OPENAI_API_KEY`

### ChromaDB não funciona

```bash
# Reinstalar ChromaDB
pip uninstall chromadb
pip install chromadb

# Ou usar a base já processada (recomendado)
# Copiar pasta server/knowledge_base/ do ZIP
```

---

## 📞 Suporte

**Email:** genius@risetech.co.mz  
**Telefone:** +258 826 074 507  
**Empresa:** Rise Tech IA & Bravantic

---

## ✅ Checklist de Deploy

- [ ] Node.js 22+ instalado
- [ ] pnpm instalado
- [ ] MySQL/TiDB configurado
- [ ] `.env` criado com todas as variáveis
- [ ] `pnpm install` executado
- [ ] `pnpm db:push` executado
- [ ] Chaves de API configuradas (Claude ou OpenAI)
- [ ] `pnpm dev` funciona localmente
- [ ] Build de produção testado (`pnpm build`)
- [ ] Deploy em servidor/cloud
- [ ] DNS configurado (se aplicável)
- [ ] SSL/HTTPS configurado (Let's Encrypt)
- [ ] Backups da base de dados configurados

---

**Boa sorte com o deploy! 🚀**

