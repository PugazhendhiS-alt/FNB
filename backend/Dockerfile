FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma/ ./prisma/
RUN npx prisma generate

COPY . .

CMD sh -c "npx prisma db push && node src/server.js"