# Shopee Delivery Partners

Uma plataforma inovadora para recrutamento de entregadores para a Shopee, otimizando o processo de onboarding digital para o mercado brasileiro.

## 🚀 Opções de Deploy (Atualizado Abril 2025)

Este projeto pode ser implantado de duas maneiras diferentes:

### 1. Deploy Completo no Heroku (Recomendado)

Para implantar o aplicativo completo no Heroku seguindo nossa nova configuração otimizada:

1. Já configuramos o Procfile principal para usar nosso servidor simplificado:
   ```
   web: node heroku-simple-server.js
   ```
   
   > Nota: Temos dois servidores disponíveis:
   > - `heroku-simple-server.js`: Versão simples, mais robusta e menos propensa a erros de sintaxe
   > - `heroku-server.js`: Versão avançada com mais recursos de diagnóstico

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

### Página em branco ou erro no deploy

1. Verifique os logs do Heroku: 
   ```bash
   heroku logs --tail
   ```

2. Se houver erro de sintaxe, use nosso servidor simplificado:
   ```bash
   # Edite Procfile para usar a versão simplificada
   echo "web: node heroku-simple-server.js" > Procfile
   git add Procfile
   git commit -m "Use simplified server"
   git push heroku main
   ```

3. Nossos servidores estão configurados para automaticamente:
   - Detectar e corrigir caminhos absolutos para relativos
   - Adicionar um indicador visual durante o carregamento
   - Fazer fallback para caminhos alternativos se o original falhar
   - Injetar CSS de emergência para garantir que algo seja exibido

4. Se receber erros relacionados a template literals ou sintaxe, o servidor simplificado resolve:
   - Ele usa uma abordagem mais simples com menos ES6 avançado
   - Evita template literals aninhados que podem causar problemas de parse

5. Após qualquer alteração, reinicie a aplicação:
   ```bash
   heroku restart
   ```

6. Limpe o cache do navegador ou teste com um navegador anônimo

### Problemas comuns e soluções

#### Erro: SyntaxError: missing ) after argument list
Este erro acontece por causa de template literals aninhados no código. Use o `heroku-simple-server.js` que evita esse problema.

#### Erro: Cannot find module
Verifique se todas as dependências estão no `package.json` e que `npm install` foi executado durante o build do Heroku.

#### Página branca (sem erro no console)
Provavelmente um problema com caminhos de assets. Nossos servidores corrigem isso.

### Alternativa de última instância

Se você continuar com problemas, considere a abordagem de separar frontend e backend:
1. Frontend no Netlify/Vercel (já temos arquivos de configuração prontos)
2. Backend no Heroku (use o `api-server.js` específico para esse caso)

## 📁 Estrutura do Projeto

- `/client`: Código frontend em React/TypeScript
- `/server`: API backend com Express
- `/shared`: Esquemas e tipos compartilhados
- `/dist`: Arquivos compilados para produção 
- `/heroku-simple-server.js`: Servidor simplificado e robusto para Heroku
- `/heroku-server.js`: Servidor avançado com mais recursos (pode ter problemas de sintaxe)
- `/static-server.js`: Servidor estático alternativo para testes
- `/api-server.js`: Servidor apenas para API (usado no deploy separado)

## 🛠️ Tecnologias

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, PostgreSQL
- **Deploy**: Heroku, Netlify, Vercel (configurações para todos)
- **Autenticação**: JWT, Sessions
- **Pagamentos**: PIX integração
- **Performance**: Server-side caching, gzip compression

## 📝 Notas de desenvolvimento

Os arquivos de configuração `.buildpacks`, `app.json`, `static.json`, `nginx_app.conf` existem para facilitar o deploy e otimizar a entrega de conteúdo estático no Heroku. Não é necessário modificá-los, mas eles contêm importantes configurações de performance e segurança.