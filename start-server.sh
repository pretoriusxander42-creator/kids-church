#!/bin/bash

# Kids Church Check-in System - Startup Script
# Run this script on Sunday morning to start the system

set -e  # Exit on error

echo "=================================================="
echo "🏫 Kids Church Check-in System - Starting..."
echo "=================================================="
echo ""

# Check if port 4000 is already in use
if lsof -ti:4000 > /dev/null 2>&1; then
    echo "⚠️  Server already running on port 4000"
    echo ""
    read -p "Do you want to restart it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🛑 Stopping existing server..."
        kill $(lsof -ti:4000) || true
        sleep 2
    else
        echo "✅ Using existing server"
        echo ""
        echo "=================================================="
        echo "📱 Access the system at:"
        echo "   http://localhost:4000"
        echo "=================================================="
        exit 0
    fi
fi

# Build the TypeScript code
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build complete"
echo ""

# Start the server in the background
echo "🚀 Starting server..."
node dist/server.js > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to initialize..."
sleep 3

# Check if server is running
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Server is healthy!"
    echo ""
    echo "=================================================="
    echo "🎉 System is ready!"
    echo "=================================================="
    echo ""
    echo "📱 Access the system at:"
    echo "   http://localhost:4000"
    echo ""
    echo "👤 Admin Logins:"
    echo "   - pretoriusxander42@gmail.com"
    echo "   - xanderpretorius2002@gmail.com"
    echo ""
    echo "📋 Server Details:"
    echo "   - Process ID: $SERVER_PID"
    echo "   - Log file: server.log"
    echo ""
    echo "🛑 To stop the server later:"
    echo "   kill $SERVER_PID"
    echo "   OR: ./stop-server.sh"
    echo ""
    echo "=================================================="
else
    echo "❌ Server failed to start"
    echo "Check server.log for details"
    exit 1
fi
