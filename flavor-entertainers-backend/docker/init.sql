-- Initial database setup for local development
-- This file is used when running PostgreSQL in Docker

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE flavor_entertainers'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'flavor_entertainers');