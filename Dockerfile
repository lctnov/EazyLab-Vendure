# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package.json + package-lock.json và cài dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Expose port NestJS
EXPOSE 1211

# Chạy entrypoint script
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
