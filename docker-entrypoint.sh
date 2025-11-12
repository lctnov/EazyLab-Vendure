#!/bin/sh

echo "Generating Prisma Client..."
npx prisma generate

echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting NestJS..."
node dist/main.js