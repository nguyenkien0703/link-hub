#!/bin/sh
set -e

echo "Running database migrations..."
prisma migrate deploy

echo "Running database seed..."
node prisma/seed.js || echo "Seed already ran or skipped"

echo "Starting application..."
exec node server.js
