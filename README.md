# Shopee Delivery Partners

Uma plataforma inovadora para recrutamento de entregadores para a Shopee, otimizando o processo de onboarding digital para o mercado brasileiro.

## 🚀 Opções de Deploy (Atualizado Abril 2025)

Este projeto pode ser implantado de duas maneiras diferentes:

### 1. Deploy Completo no Heroku (Recomendado)

Para implantar o aplicativo completo no Heroku seguindo nossa nova configuração otimizada:

1. Já configuramos o Procfile principal para usar nosso servidor especializado:
   ```
   web: node heroku-server.js
   ```

2. Certifique-se de que você tem o buildpack Node.js configurado:
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. Se estiver usando o PostgreSQL, adicione também:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. Faça o deploy para o Heroku:
   ```bash
   git push heroku main
   ```

5. Se estiver encontrando qualquer erro, execute:
   ```bash
   heroku logs --tail
   ```

### 2. Frontend em serviço de hospedagem estática (Netlify/Vercel) + Backend no Heroku

Esta abordagem é uma alternativa caso o deploy unificado não funcione:

#### Frontend (Netlify ou Vercel)

1. Configure o repositório no Netlify/Vercel
2. Netlify: Arquivo `netlify.toml` já configurado com as regras corretas
3. Vercel: Arquivo `vercel.json` com configurações otimizadas
4. Configure a variável de ambiente no serviço:
   - `API_URL`: URL da sua API no Heroku (ex: https://sua-app-api.herokuapp.com)

#### Backend (Heroku)

1. Use o Procfile.api-only:
   ```bash
   cp Procfile.api-only Procfile
   ```
   
2. Faça deploy para o Heroku:
   ```bash
   git push heroku main
   ```

## 🔧 Solução de Problemas (Atualizado Abril 2025)

Se encontrar problemas com a aplicação no Heroku:

### Página em branco após deploy

1. Verifique os logs do Heroku: 
   ```bash
   heroku logs --tail
   ```

2. Nosso novo servidor Heroku (heroku-server.js) adiciona logs detalhados que ajudam a identificar problemas:
   - Registra todos os paths de assets solicitados
   - Detalha quando ocorre redirecionamento
   - Mostra problemas de carregamento de recursos

3. O servidor foi configurado para automaticamente:
   - Detectar e corrigir caminhos absolutos para relativos
   - Adicionar um indicador visual durante o carregamento
   - Fazer fallback para caminhos alternativos se o original falhar
   - Injetar CSS de emergência para garantir que algo seja exibido

4. Se mesmo assim não funcionar, tente:
   ```bash
   heroku restart
   ```

5. Limpe o cache do navegador ou teste com um navegador anônimo

### Alternativa de última instância

Se o servidor heroku-server.js não resolver, use a abordagem alternativa de hospedagem separada (frontend no Netlify/Vercel e backend no Heroku).

## 📁 Estrutura do Projeto

- `/client`: Código frontend em React/TypeScript
- `/server`: API backend com Express
- `/shared`: Esquemas e tipos compartilhados
- `/dist`: Arquivos compilados para produção 
- `/heroku-server.js`: Servidor otimizado para Heroku
- `/static-server.js`: Servidor estático alternativo
- `/api-server.js`: Servidor apenas para API

## 🛠️ Tecnologias

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, PostgreSQL
- **Deploy**: Heroku, Netlify, Vercel (configurações para todos)
- **Autenticação**: JWT, Sessions
- **Pagamentos**: PIX integração
- **Performance**: Server-side caching, gzip compression

## 📝 Notas de desenvolvimento

Os arquivos de configuração `.buildpacks`, `app.json`, `static.json`, `nginx_app.conf` existem para facilitar o deploy e otimizar a entrega de conteúdo estático no Heroku. Não é necessário modificá-los, mas eles contêm importantes configurações de performance e segurança.