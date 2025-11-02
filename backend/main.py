from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import shutil
from pathlib import Path

from rag_service import RAGService

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="RAG Chatbot API",
    description="API for Retrieval-Augmented Generation chatbot with source attribution",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG service
rag_service = RAGService()

# Create upload directory
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# Pydantic models
class QueryRequest(BaseModel):
    question: str
    k: Optional[int] = 4


class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]
    success: bool


class UploadResponse(BaseModel):
    success: bool
    message: str
    filename: str
    chunks: int


class StatsResponse(BaseModel):
    total_documents: int
    collection_name: str
    embedding_model: Optional[str] = None


# API Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "RAG Chatbot API",
        "version": "1.0.0",
        "endpoints": {
            "query": "/api/query",
            "upload": "/api/upload",
            "stats": "/api/stats",
            "health": "/api/health"
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "RAG Chatbot API"
    }


@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """Query the RAG system with a question"""
    try:
        result = rag_service.query(request.question, request.k)
        return QueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and index a document (PDF or TXT)"""
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ["pdf", "txt"]:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and TXT files are supported"
            )
        
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Index the document
        result = rag_service.load_and_index_document(
            str(file_path),
            file_type=file_extension
        )
        
        # Clean up uploaded file (optional - comment out to keep files)
        # file_path.unlink()
        
        return UploadResponse(
            success=result["success"],
            message=result["message"],
            filename=file.filename,
            chunks=result["chunks"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get collection statistics"""
    try:
        stats = rag_service.get_collection_stats()
        return StatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/clear")
async def clear_collection():
    """Clear all documents from the collection"""
    try:
        result = rag_service.clear_collection()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
