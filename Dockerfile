FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl ca-certificates
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
EXPOSE 3002
CMD ["node","src/server.js"]
