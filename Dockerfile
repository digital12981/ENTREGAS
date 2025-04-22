FROM node:22

WORKDIR /app

# Copiar configurações básicas primeiro
COPY package*.json ./
COPY engines.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Instalar todas as dependências (incluindo as de dev)
RUN npm install

# Copiar o restante do código
COPY . .

# Construir a aplicação
RUN npm run build

# Limpar dependências e reinstalar apenas as de produção
RUN rm -rf node_modules && npm install

# Expor a porta que o app usa
EXPOSE 5000

# Definir as variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=5000

# Iniciar a aplicação
CMD ["npm", "start"]