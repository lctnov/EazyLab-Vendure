FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# TỰ ĐỘNG LOAD .env.docker
ENV NODE_ENV=docker

# Generate Prisma Client với .env.docker
RUN npx prisma generate

RUN npm run build

EXPOSE 1211

ENTRYPOINT ["sh", "docker-entrypoint.sh"]