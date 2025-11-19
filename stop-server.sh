#!/bin/bash

# Kids Church Check-in System - Stop Script

echo "🛑 Stopping Kids Church Check-in Server..."

if lsof -ti:4000 > /dev/null 2>&1; then
    kill $(lsof -ti:4000)
    echo "✅ Server stopped"
else
    echo "⚠️  No server running on port 4000"
fi
