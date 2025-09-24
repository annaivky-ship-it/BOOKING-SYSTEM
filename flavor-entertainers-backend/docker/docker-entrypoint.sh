#!/bin/sh
set -e

echo "🚀 Starting Flavor Entertainers API..."

# Wait for Redis to be ready if REDIS_URL is set
if [ -n "$REDIS_URL" ]; then
    echo "⏳ Waiting for Redis to be ready..."

    # Extract host and port from Redis URL
    REDIS_HOST=$(echo $REDIS_URL | sed 's|redis://||' | cut -d: -f1)
    REDIS_PORT=$(echo $REDIS_URL | sed 's|redis://||' | cut -d: -f2 | cut -d/ -f1)

    # Default port if not specified
    if [ -z "$REDIS_PORT" ] || [ "$REDIS_PORT" = "$REDIS_HOST" ]; then
        REDIS_PORT=6379
    fi

    # Wait for Redis to be ready
    while ! nc -z $REDIS_HOST $REDIS_PORT; do
        echo "⏳ Waiting for Redis at $REDIS_HOST:$REDIS_PORT..."
        sleep 2
    done

    echo "✅ Redis is ready!"
fi

# Run database migrations if in production and migrations are available
if [ "$NODE_ENV" = "production" ] && [ -f "db/migrations/run.ts" ]; then
    echo "🗄️  Running database migrations..."
    node -r esbuild-register db/migrations/run.ts || echo "⚠️  Migration failed or already applied"
fi

echo "🎯 Environment: $NODE_ENV"
echo "🌐 Port: ${PORT:-8080}"

# Execute the main command
exec "$@"