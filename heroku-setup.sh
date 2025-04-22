#!/bin/bash

# Script para preparar o ambiente Heroku
echo "🚀 Iniciando setup para Heroku..."

# Criar diretório para o app do Heroku
mkdir -p heroku_app

# Copiar arquivos do servidor
cp heroku.cjs heroku_app/
cp server-minimal.cjs heroku_app/
cp server-fallback.js heroku_app/
cp heroku-index.js heroku_app/
cp Procfile heroku_app/
cp heroku-package.json heroku_app/package.json

# Copiar páginas HTML estáticas
echo "📂 Copiando páginas estáticas..."
mkdir -p heroku_app/static_html
cp -r static_html/* heroku_app/static_html/ 2>/dev/null || echo "⚠️ Nenhuma página estática encontrada"

echo "✅ Setup concluído com sucesso!"