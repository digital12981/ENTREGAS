#!/bin/bash
# Script de configuração para o Heroku
# Este script prepara os arquivos para deploy no Heroku

echo "=== Iniciando configuração para o Heroku ==="

# Renomear o package.json padrão para não interferir
if [ -f "package.json" ]; then
  echo "Renomeando package.json original para package.json.orig"
  mv package.json package.json.orig
fi

# Copiar o package.json do Heroku
if [ -f "heroku-package.json" ]; then
  echo "Copiando heroku-package.json para package.json"
  cp heroku-package.json package.json
else
  echo "ERRO: Arquivo heroku-package.json não encontrado!"
  exit 1
fi

# Verificar os arquivos necessários
for file in heroku.cjs server-minimal.cjs Procfile; do
  if [ -f "$file" ]; then
    echo "Verificado: $file existe"
  else
    echo "ERRO: Arquivo $file não encontrado!"
    exit 1
  fi
done

# Garantir que o Procfile esteja configurado corretamente
if grep -q "heroku.cjs" Procfile; then
  echo "Procfile está configurado corretamente"
else
  echo "AVISO: Procfile pode não estar configurado corretamente"
  echo "Conteúdo atual do Procfile:"
  cat Procfile
  echo "Corrigindo Procfile..."
  echo "web: node heroku.cjs" > Procfile
fi

echo "=== Configuração para o Heroku concluída com sucesso ==="
echo "Use 'git add .' e 'git commit' para confirmar as alterações"
echo "Em seguida, use 'git push heroku main' para fazer o deploy"