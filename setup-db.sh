#!/bin/bash

echo "🗄️ Configurando Banco de Dados MySQL para o Genius"
echo ""

# Verificar se o MySQL está rodando
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL não está instalado. Instale primeiro:"
    echo "   sudo apt install mysql-server"
    exit 1
fi

echo "✅ MySQL encontrado"

# Verificar se o serviço está rodando
if ! systemctl is-active --quiet mysql; then
    echo "⚠️  MySQL não está rodando. Iniciando..."
    sudo systemctl start mysql
fi

echo "✅ MySQL está rodando"

# Criar banco se não existir
echo "📝 Criando banco de dados 'genius_db'..."
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS genius_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES LIKE 'genius_db';
EOF

echo ""
echo "🔧 Agora configure o .env com suas credenciais:"
echo "   DATABASE_URL=mysql://root:SUA_SENHA@localhost:3306/genius_db"
echo ""
echo "📊 Depois execute as migrações:"
echo "   npm run db:push"
echo ""
echo "🚀 E inicie o servidor:"
echo "   npm run dev"