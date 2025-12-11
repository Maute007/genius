# 🗄️ Configuração do Banco de Dados MySQL

## 1. Instalar MySQL (se não tiver)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Iniciar o serviço
sudo systemctl start mysql
sudo systemctl enable mysql

# Configurar segurança (opcional)
sudo mysql_secure_installation
```

## 2. Criar o banco de dados

```bash
# Entrar no MySQL
sudo mysql -u root -p

# Criar o banco
CREATE DATABASE genius_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Criar usuário (opcional, mais seguro)
CREATE USER 'genius_user'@'localhost' IDENTIFIED BY 'OlaOla123';
GRANT ALL PRIVILEGES ON genius_db.* TO 'genius_user'@'localhost';
FLUSH PRIVILEGES;

# Sair
EXIT;
```

## 3. Atualizar a DATABASE_URL no .env

Edite o arquivo `.env` com suas credenciais reais:

```env
# Opção 1: Com usuário root (menos seguro)
DATABASE_URL=mysql://root:sua_senha@localhost:3306/genius_db

# Opção 2: Com usuário específico (mais seguro)
DATABASE_URL=mysql://genius_user:sua_senha@localhost:3306/genius_db
```

## 4. Executar as migrações

```bash
# Na pasta do projeto
cd /home/maute007/Desktop/projetos/genius-codigo-completo/genius

# Executar as migrações do Drizzle
npm run db:push
# ou
npx drizzle-kit push:mysql
```

## 5. Verificar se funcionou

```bash
# Reiniciar o servidor
npm run dev
```

Se tudo estiver correto, você deve ver:
- Sem erros de "Database not available"
- Tabelas criadas no MySQL
- Sistema funcionando normalmente

## 6. Comandos úteis do banco

```bash
# Ver o esquema atual
npx drizzle-kit introspect:mysql

# Gerar migrações (se fizer mudanças no schema)
npx drizzle-kit generate:mysql

# Ver status das migrações
npx drizzle-kit up:mysql
```