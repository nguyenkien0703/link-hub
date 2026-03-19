#!/bin/sh
set -e

echo "Waiting for database to be ready..."
MAX_RETRIES=30
RETRY=0
until prisma migrate deploy 2>/dev/null; do
  RETRY=$((RETRY + 1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "ERROR: Database not reachable after ${MAX_RETRIES} attempts. Exiting."
    exit 1
  fi
  echo "  Database not ready yet (attempt ${RETRY}/${MAX_RETRIES}), retrying in 2s..."
  sleep 2
done

echo "Running database seed..."
node prisma/seed.js || echo "Seed skipped (already ran)"

echo "Starting application..."
exec node server.js
