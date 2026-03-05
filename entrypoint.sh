#!/bin/sh
set -e

echo "Waiting for postgres at ${DB_HOST}:${DB_PORT}..."
for i in $(seq 1 30); do
  if nc -z "$DB_HOST" "${DB_PORT:-5432}" 2>/dev/null; then
    echo "Postgres is ready."
    break
  fi
  echo "Attempt $i/30 — postgres not ready, retrying in 2s..."
  sleep 2
done

echo "Running database migrations..."
node_modules/.bin/prisma migrate deploy

echo "Seeding database..."
node dist/seed.cjs

echo "Starting application..."
exec node dist/index.js
