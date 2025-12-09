#!/bin/bash
set -e

echo "🧪 Starting test database initialization..."

# Load test environment variables
if [ -f ".env.test" ]; then
  set -a
  source ".env.test"
  set +a
  echo "ℹ️  Loaded environment variables from .env.test"
else
  echo "⚠️  .env.test not found, using default test configuration"
  # Set default test database URL if not provided
  export DATABASE_URL="${DATABASE_URL:-postgresql://test_user:test_password@localhost:5433/audiophile_test_db}"
  export NODE_ENV="test"
fi

echo "📍 Using database: $DATABASE_URL"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set"
  echo "   Please create .env.test with DATABASE_URL"
  exit 1
fi

# Extract database connection details for PostgreSQL commands
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\).*/\1/p')
DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\).*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "🔍 Database details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
    echo "   PostgreSQL is unavailable - sleeping (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
  else
    echo "❌ PostgreSQL failed to become ready after $MAX_ATTEMPTS attempts"
    echo "   Please check if PostgreSQL is running on $DB_HOST:$DB_PORT"
    exit 1
  fi
done

# Check if database exists, create if not
echo "🔍 Checking if database exists..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "✅ Database '$DB_NAME' already exists"
else
  echo "📦 Creating database '$DB_NAME'..."
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "CREATE DATABASE $DB_NAME;" || {
    echo "❌ Failed to create database"
    exit 1
  }
  echo "✅ Database created successfully"
fi

# Run Drizzle migrations to set up schema
echo "📦 Pushing database schema..."
bun run db:generate || {
  echo "⚠️  Schema generation skipped (already up to date)"
}

bun run db:push || {
  echo "❌ Failed to push database schema"
  exit 1
}

# Seed the database with test data
echo "🌱 Seeding test database..."
bun run db:seed --force || {
  echo "❌ Failed to seed database"
  exit 1
}

echo "🎉 Test database initialization completed!"
echo ""
echo "✅ Ready to run tests with: bun test"

