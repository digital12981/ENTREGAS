# Shopee Delivery Partners

Uma plataforma inovadora para recrutamento de entregadores para a Shopee, otimizando o processo de onboarding digital para o mercado brasileiro.

## Opções de Deploy

Este projeto pode ser implantado de duas maneiras diferentes:

### 1. Heroku com Express.js para o frontend e backend unificados

Para implantar o aplicativo completo no Heroku:

1. Certifique-se de que o Procfile está configurado como:
   ```
   web: NODE_ENV=production node static-server.js
   ```

2. Faça deploy para o Heroku normalmente:
   ```
   git push heroku main
   ```

### 2. Frontend em serviço de hospedagem estática (Netlify/Vercel) + Backend no Heroku

Esta é a opção recomendada para melhor performance:

#### Frontend (Netlify)

1. Configure o repositório no Netlify
2. Netlify usará o arquivo `netlify.toml` já existente
3. Configure a variável de ambiente no Netlify:
   - `API_URL`: URL da sua API no Heroku (ex: https://sua-app.herokuapp.com)

#### Backend (Heroku)

1. Altere o Procfile para usar apenas o backend:
   ```
   web: NODE_ENV=production node backend-server.js
   ```
2. Faça deploy para o Heroku

## Solução de Problemas

Se a aplicação estiver com uma tela branca no Heroku:

1. Verifique os logs do Heroku: `heroku logs --tail`
2. Certifique-se de que os arquivos estáticos estão sendo servidos corretamente
3. Uma alternativa é usar a abordagem de split entre frontend e backend

## Estrutura

- `/client`: Código frontend em React
- `/server`: Código backend em Express
- `/shared`: Esquemas e tipos compartilhados
- `/dist`: Arquivos compilados para produção

## Tecnologias

- Node.js com TypeScript
- Express.js
- React
- Vite
- PostgreSQL
- Heroku/Netlify/Vercel