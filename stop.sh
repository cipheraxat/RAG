#!/bin/bash

# RAG Chatbot - Stop Script
# This script stops both backend and frontend servers

echo "Stopping RAG Chatbot servers..."

# Check if PID files exist
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "✓ Backend stopped"
    else
        echo "Backend process not found"
    fi
    rm .backend.pid
else
    echo "No backend PID file found"
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "✓ Frontend stopped"
    else
        echo "Frontend process not found"
    fi
    rm .frontend.pid
else
    echo "No frontend PID file found"
fi

# Also try to kill any remaining processes on ports 8000 and 3000
echo "Checking for remaining processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "Cleaned up port 8000" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "Cleaned up port 3000" || true

echo ""
echo "All servers stopped."
