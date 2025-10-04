#!/bin/bash

echo ""
echo "==================================="
echo " FLAVOR ENTERTAINERS - DEV SERVER"
echo "==================================="
echo ""

echo "Checking environment..."
if [ ! -f .env.local ]; then
    echo "ERROR: .env.local file not found!"
    echo "Please copy .env.example to .env.local and configure your variables."
    exit 1
fi

echo "Environment file found ✓"
echo ""

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo "Dependencies installed ✓"
echo ""

echo "Testing database connection..."
node test-db-connection.js
echo ""

echo "Starting development server..."
echo "Open http://localhost:3000 in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev