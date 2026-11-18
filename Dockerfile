FROM node:24-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

RUN mkdir -p uploads/documents uploads/proofs logs \
    && chown -R node:node /app

USER node

EXPOSE 8080

CMD ["npm", "start"]
