# Quick Start Guide

This guide will help you get the RAG Chatbot up and running in 5 minutes.

## Prerequisites Check

Before starting, ensure you have:
- [ ] Python 3.8+ installed (`python --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Google AI (Gemini) API key (create one at https://aistudio.google.com/)

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env and add your Google AI (Gemini) API key
```

## Step 2: Frontend Setup (1 minute)

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install
```

## Step 3: Run the Application (30 seconds)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 4: Use the Application (1 minute)

1. Open http://localhost:3000 in your browser
2. Go to "Upload" tab
3. Upload a PDF or TXT document
4. Go to "Chat" tab
5. Ask questions about your document!

## Example Questions to Try

After uploading a document, try asking:
- "What is the main topic of this document?"
- "Can you summarize the key points?"
- "What does [specific term] mean according to the document?"

## Troubleshooting

### Backend won't start
- Check if port 8000 is available
- Verify Google Gemini API key is set in `.env`
- Make sure virtual environment is activated

### Frontend won't start
- Check if port 3000 is available
- Run `npm install` again if needed
- Clear `.next` folder: `rm -rf .next`

### "Cannot connect to backend" error
- Ensure backend is running on http://localhost:8000
- Check backend terminal for errors
- Verify `.env.local` has correct API URL

## Next Steps

- Read the full [README.md](../README.md) for detailed information
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details
- Explore the code in `backend/` and `frontend/` directories

Happy chatting! 🤖
