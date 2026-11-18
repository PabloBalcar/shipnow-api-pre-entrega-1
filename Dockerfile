# Etapa 1: instalación de dependencias de producción
FROM node:24-bookworm-slim AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force


# Etapa 2: imagen final de ejecución
FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN mkdir -p uploads/documents uploads/proofs logs \
    && chown -R node:node /app

USER node

EXPOSE 8080

CMD ["npm", "start"]