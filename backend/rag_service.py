import os
from typing import Dict, Any, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import PyPDFLoader, TextLoader
import chromadb
from chromadb.config import Settings


class RAGService:
    def __init__(self):
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        self.llm_provider = os.getenv("LLM_PROVIDER", "google").lower()
        self.llm_model = os.getenv("LLM_MODEL")
        self.chroma_db_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
        
        # Initialize embeddings
        self.embeddings = HuggingFaceEmbeddings(
            model_name=self.embedding_model,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        # Initialize vector store
        self.vectorstore = None
        self._initialize_vectorstore()
        
        # Initialize LLM (lazily handle missing credentials)
        self.llm = None
        self.llm_error: Optional[str] = None
        try:
            self.llm = self._initialize_llm()
        except Exception as exc:  # noqa: BLE001 - surface initialization failures nicely
            self.llm_error = str(exc)
            print(f"LLM initialization failed: {self.llm_error}")

    def _initialize_llm(self):
        """Initialise underlying LLM client based on configured provider."""
        provider = self.llm_provider or "google"

        if provider not in {"google", "gemini"}:
            raise ValueError("LLM_PROVIDER must be set to 'google' for Gemini models.")

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is required to use Gemini.")

        requested_model = (self.llm_model or "gemini-pro").strip()
        model_aliases = {
            "gemini-1.5-pro": "gemini-1.5-pro-latest",
            "gemini-1.5-flash": "gemini-1.5-flash-latest",
            "gemini-1.5-flash-001": "gemini-1.5-flash-latest",
            "gemini-1.5-pro-001": "gemini-1.5-pro-latest",
            "gemini-2.5-pro": "gemini-2.5-pro",
            "gemini-2.5-pro-001": "gemini-2.5-pro",
        }
        model_name = model_aliases.get(requested_model, requested_model)

        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0.7,
            google_api_key=api_key,
        )
        
    def _initialize_vectorstore(self):
        """Initialize or load existing vector store"""
        try:
            self.vectorstore = Chroma(
                persist_directory=self.chroma_db_path,
                embedding_function=self.embeddings,
                collection_name="rag_collection"
            )
        except Exception as e:
            print(f"Creating new vector store: {e}")
            self.vectorstore = Chroma(
                persist_directory=self.chroma_db_path,
                embedding_function=self.embeddings,
                collection_name="rag_collection"
            )
    
    def load_and_index_document(self, file_path: str, file_type: str = "pdf") -> Dict[str, Any]:
        """Load and index a document into the vector store"""
        try:
            # Load document
            if file_type == "pdf":
                loader = PyPDFLoader(file_path)
            else:
                loader = TextLoader(file_path)
            
            documents = loader.load()
            
            # Split documents
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
            )
            splits = text_splitter.split_documents(documents)
            
            # Add to vector store
            self.vectorstore.add_documents(splits)
            
            return {
                "success": True,
                "message": f"Successfully indexed {len(splits)} chunks from {file_path}",
                "chunks": len(splits)
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error indexing document: {str(e)}",
                "chunks": 0
            }
    
    def query(self, question: str, k: int = 4) -> Dict[str, Any]:
        """Query the RAG system and return answer with sources"""
        try:
            if self.vectorstore is None:
                return {
                    "answer": "No documents have been indexed yet. Please upload documents first.",
                    "sources": [],
                    "success": False
                }

            if self.llm is None:
                message = self.llm_error or "Language model is not configured."
                return {
                    "answer": message,
                    "sources": [],
                    "success": False
                }
            
            # Retrieve relevant documents
            docs = self.vectorstore.similarity_search(question, k=k)
            
            if not docs:
                return {
                    "answer": "No relevant documents found for your query.",
                    "sources": [],
                    "success": True
                }
            
            # Create context from retrieved documents
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Create prompt
            prompt = ChatPromptTemplate.from_template(
                """Use the following pieces of context to answer the question at the end. 
                If you don't know the answer, just say that you don't know, don't try to make up an answer.
                
                Context:
                {context}
                
                Question: {question}
                
                Answer:"""
            )
            
            # Format the prompt with context and question
            messages = prompt.format_messages(context=context, question=question)
            
            # Get answer from LLM
            response = self.llm.invoke(messages)
            answer = response.content
            
            # Format sources
            sources = []
            for i, doc in enumerate(docs):
                source_info = {
                    "id": i + 1,
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "relevance_score": 1.0 - (i * 0.1)  # Simple scoring based on order
                }
                sources.append(source_info)
            
            return {
                "answer": answer,
                "sources": sources,
                "success": True
            }
        except Exception as e:
            error_text = str(e)
            lower_error = error_text.lower()

            if "quota" in lower_error:
                user_message = (
                    "Google Gemini quota has been exceeded for the configured key. "
                    "Please review your Google AI Studio usage or provide a different API key."
                )
            else:
                user_message = f"Error processing query: {error_text}"

            return {
                "answer": user_message,
                "sources": [],
                "success": False
            }
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the indexed documents"""
        try:
            if self.vectorstore is None:
                return {"total_documents": 0, "collection_name": "rag_collection"}
            
            collection = self.vectorstore._collection
            count = collection.count()
            
            return {
                "total_documents": count,
                "collection_name": "rag_collection",
                "embedding_model": self.embedding_model
            }
        except Exception as e:
            return {
                "total_documents": 0,
                "error": str(e)
            }
    
    def clear_collection(self) -> Dict[str, Any]:
        """Clear all documents from the collection"""
        try:
            if self.vectorstore:
                self.vectorstore._collection.delete()
                self._initialize_vectorstore()
            return {"success": True, "message": "Collection cleared successfully"}
        except Exception as e:
            return {"success": False, "message": f"Error clearing collection: {str(e)}"}
