#!/bin/sh

# --------------------------
# Chờ database sẵn sàng
# --------------------------
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

# --------------------------
# Chạy Prisma migrate
# --------------------------
npx prisma migrate deploy

# --------------------------
# Start NestJS production
# --------------------------
node dist/main.js
