#!/bin/bash
set -e

echo "🚀 Starting database initialization..."

# Load environment variables (.env.docker first, then .env.local, then .env)
if [ -f ".env.local" ] || [ -f ".env" ]; then
  set -a
  [ -f ".env.local" ] && source ".env.local"
  [ -f ".env" ] && source ".env"
  set +a
  echo "ℹ️  Loaded environment variables from .env.local/.env"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set"
  echo "   Please make sure you have copied .env.example to .env.local"
  exit 1
fi

# Wait for PostgreSQL to be ready using a simple connection test
echo "⏳ Waiting for PostgreSQL to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  # Use bun to test database connection
  if bun -e "
    import postgres from 'postgres';
    try {
      const sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 2 });
      await sql\`SELECT 1\`;
      await sql.end();
      process.exit(0);
    } catch (e) {
      process.exit(1);
    }
  " > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
    echo "   PostgreSQL is unavailable - sleeping (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
  else
    echo "❌ PostgreSQL failed to become ready after $MAX_ATTEMPTS attempts"
    echo "   Please check if Docker container is running: docker ps"
    exit 1
  fi
done

# Run database migrations
echo "📦 Running database migrations..."
bun run db:push || {
  echo "⚠️  db:push failed, trying db:migrate..."
  bun run db:migrate || {
    echo "❌ Both migration methods failed"
    exit 1
  }
}

# Seed the database (seed script will check if data exists and NODE_ENV)
if [ "$NODE_ENV" != "production" ]; then
  echo "🌱 Seeding database (will skip if data already exists)..."
  bun run db:seed
else
  echo "⚠️  Skipping database seed in production environment"
fi

echo "🎉 Database initialization completed!"

