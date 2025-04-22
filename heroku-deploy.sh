#!/bin/bash

# Script para implantar a aplicação no Heroku
echo "🚀 Iniciando script de implantação para Heroku..."

# Verificar se o diretório static_html existe
if [ ! -d "static_html" ]; then
  echo "❌ Diretório static_html não encontrado. Impossível continuar."
  exit 1
fi

# Verificar arquivos necessários
for file in heroku.cjs server-minimal.cjs server-fallback.js Procfile heroku-package.json; do
  if [ ! -f "$file" ]; then
    echo "❌ Arquivo $file não encontrado. Impossível continuar."
    exit 1
  fi
done

# Verificar se o comando heroku está instalado
if ! command -v heroku &> /dev/null; then
  echo "❌ Comando heroku não encontrado. Por favor, instale o Heroku CLI."
  exit 1
fi

# Criar diretório temporário para os arquivos de implantação
echo "📂 Criando diretório temporário para implantação..."
DEPLOY_DIR=$(mktemp -d)
echo "📂 Diretório temporário: $DEPLOY_DIR"

# Copiar arquivos necessários
echo "📦 Copiando arquivos para implantação..."
cp heroku.cjs "$DEPLOY_DIR/"
cp server-minimal.cjs "$DEPLOY_DIR/"
cp server-fallback.js "$DEPLOY_DIR/"
cp Procfile "$DEPLOY_DIR/"
cp heroku-package.json "$DEPLOY_DIR/package.json"

# Copiar páginas HTML estáticas
echo "📦 Copiando páginas HTML estáticas..."
mkdir -p "$DEPLOY_DIR/static_html"
cp -r static_html/* "$DEPLOY_DIR/static_html/"

# Navegar para o diretório de implantação
cd "$DEPLOY_DIR"

# Inicializar repositório Git
echo "🔄 Inicializando repositório Git..."
git init
git add .
git commit -m "Implantação no Heroku: $(date)"

# Criar app no Heroku se necessário ou usar app existente
HEROKU_APP_NAME="shopee-entregas"
if heroku apps:info "$HEROKU_APP_NAME" &> /dev/null; then
  echo "✅ App $HEROKU_APP_NAME já existe no Heroku."
else
  echo "🔄 Criando novo app $HEROKU_APP_NAME no Heroku..."
  heroku create "$HEROKU_APP_NAME" || {
    echo "⚠️ Não foi possível criar app com nome específico, usando nome gerado pelo Heroku..."
    heroku create
  }
fi

# Enviar para o Heroku
echo "🚀 Enviando aplicação para o Heroku..."
git push heroku master --force

# Garantir que pelo menos uma instância está rodando
echo "🔄 Escalando a aplicação..."
heroku ps:scale web=1

# Abrir a aplicação no navegador
echo "🌎 Abrindo aplicação no navegador..."
heroku open

# Exibir logs
echo "📋 Exibindo logs da aplicação..."
heroku logs --tail