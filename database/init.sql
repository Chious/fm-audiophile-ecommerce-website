-- Test Database Initialization Script
-- This script creates the test database if it doesn't exist

-- Create test database (if not exists)
-- Note: This requires connecting to PostgreSQL with superuser privileges
SELECT 'CREATE DATABASE audiophile_test_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'audiophile_test_db')\gexec

-- Grant privileges to test user (adjust username as needed)
-- GRANT ALL PRIVILEGES ON DATABASE audiophile_test_db TO test_user;
