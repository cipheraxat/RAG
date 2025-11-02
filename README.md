<img width="968" height="596" alt="image" src="https://github.com/user-attachments/assets/d7a9a962-b914-4c13-956e-231d8c13c5c2" />

# RAG Chatbot with Source Attribution

A modern, web-based Retrieval-Augmented Generation (RAG) chatbot that provides answers with source attribution. Built with Next.js frontend and FastAPI backend, this application allows users to upload documents and ask questions with transparent source references.

## Features

- 🤖 **Intelligent Q&A**: Ask questions and get accurate answers from your documents
- 📚 **Source Attribution**: View the exact sources used to generate each answer
- 📤 **Document Upload**: Support for PDF and TXT files
- 💬 **Modern Chat Interface**: Clean, responsive UI with real-time interactions
- 📊 **Statistics Dashboard**: Track indexed documents and collection stats
- 🎨 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## View 

- RAG stats view
<img width="653" height="611" alt="RAG stats" src="https://github.com/user-attachments/assets/5b2ba027-4bcd-4b7c-8792-a6a66a7ea54a" />

- RAG upload view
<img width="695" height="576" alt="RAG upload" src="https://github.com/user-attachments/assets/166ad58f-bfb6-404d-8b5d-0332ba4ef3d9" />

- RAG chat view
<img width="968" height="596" alt="RAG chat" src="https://github.com/user-attachments/assets/23ad6968-3bee-4f77-b010-f9706b93fca5" />



## Architecture

### Backend (FastAPI + LangChain)
- **FastAPI**: High-performance Python web framework
- **LangChain**: Framework for LLM applications
- **ChromaDB**: Vector database for document embeddings
- **Google Gemini**: Language model for answer generation
- **HuggingFace Embeddings**: Sentence transformers for document vectorization

### Frontend (Next.js + React)
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, responsive styling
- **Lucide React**: Beautiful icon library
- **Axios**: HTTP client for API communication

## Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- Google AI (Gemini) API key
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd RAG
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Edit .env and add your Google AI (Gemini) API key
# GOOGLE_API_KEY=your_api_key_here
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Environment variables are already set in .env.local
```

## Running the Application

### Start Backend Server

```bash
# From backend directory with activated virtual environment
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

The backend will start at `http://localhost:8000`

### Start Frontend Development Server

```bash
# From frontend directory in a new terminal
cd frontend
npm run dev
```

The frontend will start at `http://localhost:3000`

## Usage Guide

### 1. Upload Documents

1. Navigate to the **Upload** tab
2. Click "Choose a file" or drag and drop a PDF or TXT file
3. Click "Upload Document"
4. Wait for the document to be processed and indexed

### 2. Ask Questions

1. Navigate to the **Chat** tab
2. Type your question in the input field
3. Press Enter or click "Send"
4. View the answer along with the sources used

### 3. View Sources

- Sources are automatically displayed in the right panel after each query
- Each source shows:
  - Document name and page number (if applicable)
  - Relevance score
  - Text excerpt used for the answer

### 4. View Statistics

1. Navigate to the **Stats** tab
2. View total indexed documents
3. See collection information
4. Clear all documents if needed (with confirmation)

## API Documentation

### Backend Endpoints

#### POST `/api/query`
Query the RAG system with a question.

**Request Body:**
```json
{
  "question": "What is RAG?",
  "k": 4
}
```

**Response:**
```json
{
  "answer": "RAG stands for...",
  "sources": [
    {
      "id": 1,
      "content": "...",
      "metadata": {"source": "doc.pdf", "page": 1},
      "relevance_score": 0.95
    }
  ],
  "success": true
}
```

#### POST `/api/upload`
Upload and index a document.

**Request:** Multipart form data with file

**Response:**
```json
{
  "success": true,
  "message": "Successfully indexed 10 chunks",
  "filename": "document.pdf",
  "chunks": 10
}
```

#### GET `/api/stats`
Get collection statistics.

**Response:**
```json
{
  "total_documents": 25,
  "collection_name": "rag_collection",
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

#### DELETE `/api/clear`
Clear all documents from the collection.

**Response:**
```json
{
  "success": true,
  "message": "Collection cleared successfully"
}
```

#### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "RAG Chatbot API"
}
```

## Configuration

### Backend Configuration (.env)

```env
# Gemini is the only supported provider
LLM_PROVIDER=google

# Supply your Google AI (Gemini) API key
GOOGLE_API_KEY=your_google_gemini_api_key_here

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
# Optional override. Default: gemini-pro
LLM_MODEL=gemini-2.5-pro
CHROMA_DB_PATH=./chroma_db
```

### Frontend Configuration (.env.local)

```env
# Use /api when running via the built-in Next.js proxy (Codespaces, localhost)
NEXT_PUBLIC_API_URL=/api

# Or point directly at the FastAPI instance if proxying is disabled
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
RAG/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── rag_service.py       # RAG logic and vector store
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── .gitignore
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main page with tabs
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ChatInterface.tsx      # Chat UI component
│   │   ├── MessageBubble.tsx      # Message display
│   │   ├── SourceCard.tsx         # Source display
│   │   ├── DocumentUpload.tsx     # Upload interface
│   │   └── StatsPanel.tsx         # Statistics display
│   ├── lib/
│   │   └── api.ts           # API client
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
└── README.md
```

## Troubleshooting

### Backend Issues

**Error: Module not found**
```bash
# Make sure virtual environment is activated and dependencies installed
pip install -r requirements.txt
```

**Error: Gemini API key not found**
```bash
# Check .env file exists and contains GOOGLE_API_KEY
cat backend/.env
```

**Error: ChromaDB initialization failed**
```bash
# Delete existing database and restart
rm -rf backend/chroma_db
python backend/main.py
```

### Frontend Issues

**Error: Cannot connect to backend**
- Ensure backend is running on port 8000
- Check CORS settings in backend/main.py
- Verify NEXT_PUBLIC_API_URL in frontend/.env.local

**Error: Module not found**
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Development

### Adding New Features

1. **Backend**: Add endpoints in `main.py` and logic in `rag_service.py`
2. **Frontend**: Create components in `components/` and add API calls in `lib/api.ts`

### Testing

```bash
# Backend (from backend directory)
python -m pytest tests/

# Frontend (from frontend directory)
npm run test
```

### Building for Production

```bash
# Backend - use production ASGI server
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend
npm run build
npm run start
```

## Performance Optimization

- **Chunking**: Adjust `chunk_size` and `chunk_overlap` in `rag_service.py`
- **Retrieval**: Modify `k` parameter for number of retrieved documents
- **Embeddings**: Use different embedding models for better accuracy
- **Caching**: Implement Redis for query caching

## Security Considerations

- Store API keys securely (never commit .env files)
- Implement authentication for production deployments
- Validate and sanitize file uploads
- Rate limit API endpoints
- Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation

## Acknowledgments

- Google for Gemini models
- LangChain for the RAG framework
- Vercel for Next.js
- ChromaDB for vector storage

---

Built with ❤️ using Next.js, FastAPI, and LangChain
