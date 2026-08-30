FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

EXPOSE 3001

USER node

CMD ["npm", "start"]
