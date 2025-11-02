#!/bin/bash

# RAG Chatbot - Setup and Start Script
# This script automates the setup and startup of both backend and frontend

set -e  # Exit on error

echo "=================================="
echo "RAG Chatbot Setup & Startup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python found: $(python3 --version)${NC}"

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"
echo ""

# Setup Backend
echo "=================================="
echo "Setting up Backend..."
echo "=================================="
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}Virtual environment already exists${NC}"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${RED}⚠ Please edit backend/.env and add your Google AI (Gemini) API key${NC}"
    echo "Press Enter after updating the API key..."
    read
fi

echo -e "${GREEN}✓ Backend setup complete${NC}"
cd ..
echo ""

# Setup Frontend
echo "=================================="
echo "Setting up Frontend..."
echo "=================================="
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}Dependencies already installed${NC}"
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"
cd ..
echo ""

# Start servers
echo "=================================="
echo "Starting Servers..."
echo "=================================="
echo ""

# Start backend in background
echo "Starting Backend server..."
cd backend
source venv/bin/activate
python main.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "  Backend logs: backend.log"
echo "  Backend URL: http://localhost:8000"
echo ""

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is ready${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}Error: Backend did not start properly${NC}"
        echo "Check backend.log for errors"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
done
echo ""

# Start frontend
echo "Starting Frontend server..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "  Frontend logs: frontend.log"
echo "  Frontend URL: http://localhost:3000"
echo ""

# Save PIDs for cleanup
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo "=================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=================================="
echo ""
echo "🚀 Your RAG Chatbot is now running!"
echo ""
echo "📱 Open your browser to: http://localhost:3000"
echo ""
echo "To stop the servers, run: ./stop.sh"
echo "Or press Ctrl+C and run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Logs are available at:"
echo "  - backend.log"
echo "  - frontend.log"
echo ""

# Keep script running
wait
