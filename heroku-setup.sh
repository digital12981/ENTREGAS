#!/bin/bash

# Script para preparar o ambiente Heroku
# Este script será executado durante o processo de build no Heroku

echo "🚀 Iniciando setup para Heroku..."

# Mover os arquivos específicos do Heroku para seus locais corretos
echo "📦 Configurando arquivos do Heroku"
cp heroku.cjs ./index.cjs
cp heroku-package.json ./package.json
cp server-minimal.cjs ./server-minimal.cjs
cp server-fallback.js ./server-fallback.js

# Verificar se o diretório dist existe
if [ ! -d "dist" ]; then
  echo "📂 Criando diretório dist"
  mkdir -p dist
fi

# Verificar se temos o diretório client/dist
if [ -d "client/dist" ]; then
  echo "📂 Copiando arquivos estáticos de client/dist para dist"
  cp -r client/dist/* dist/
fi

# Verificar se temos o diretório dist/client
if [ -d "dist/client" ]; then
  echo "📂 Movendo arquivos de dist/client para dist"
  cp -r dist/client/* dist/
fi

# Verificar se temos arquivos de build em dist
if [ "$(ls -A dist 2>/dev/null)" ]; then
  echo "✅ Arquivos estáticos disponíveis em dist:"
  ls -la dist/ | head -10
else
  echo "⚠️ Nenhum arquivo estático encontrado, criando uma página básica"
  # Criar um index.html básico caso não exista
  cat > dist/index.html << 'EOL'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopee Entregas</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #ee4d2d;
      color: white;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
      border-radius: 8px;
    }
    .card {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Shopee Entregas</h1>
    <p>Portal do Entregador Parceiro</p>
  </div>
  
  <div class="card">
    <h2>Estamos em preparação</h2>
    <p>A página completa estará disponível em breve.</p>
    <p>Por favor, aguarde enquanto finalizamos o carregamento do site.</p>
  </div>
  
  <script>
    // Redirecionamento automático para a Home após 3 segundos
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  </script>
</body>
</html>
EOL
fi

echo "✅ Setup para Heroku concluído com sucesso!"