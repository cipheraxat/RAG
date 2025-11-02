# Demo Instructions

This document provides detailed instructions for demonstrating the RAG Chatbot application.

## Demo Preparation

### 1. Prepare Sample Documents

For the best demo experience, prepare 2-3 sample documents:

**Option A: Use sample documents**
- Download a few PDF articles or research papers
- Create a TXT file with relevant information
- Examples: Technical documentation, product guides, research papers

**Option B: Create custom documents**
Create a simple TXT file with content like:
```
About RAG Systems

Retrieval-Augmented Generation (RAG) is a technique that enhances Large Language Models 
by providing them with relevant context from a knowledge base. This allows the model to 
generate more accurate and contextual responses.

Key benefits:
- Improved accuracy
- Source attribution
- Domain-specific knowledge
- Reduced hallucinations
```

### 2. Environment Check

```bash
# Check backend
curl http://localhost:8000/api/health

# Should return: {"status":"healthy","service":"RAG Chatbot API"}
```

## Demo Script

### Part 1: Introduction (1 minute)

**Talking Points:**
- "This is a RAG Chatbot that lets you ask questions about your documents"
- "It provides answers with full source attribution"
- "Built with Next.js, FastAPI, and LangChain"

### Part 2: Document Upload (2 minutes)

**Steps:**
1. Navigate to the **Upload** tab
2. Click "Choose a file" and select a sample document
3. Show the file preview with size information
4. Click "Upload Document"
5. **Point out**: Success message showing number of chunks indexed
6. Explain: "The document is split into chunks and converted to embeddings"

### Part 3: Asking Questions (3 minutes)

**Steps:**
1. Navigate to the **Chat** tab
2. Ask a simple question: "What is this document about?"
3. **Show**: 
   - The thinking indicator while processing
   - The answer appears with proper formatting
   - Sources panel updates automatically

4. Click "View X sources" link
5. **Demonstrate**: 
   - Source cards with relevance scores
   - Document excerpts
   - Page numbers (for PDFs)

6. Ask a more specific question related to the content
7. **Show**: Different sources may be retrieved for different questions

### Part 4: Statistics Dashboard (1 minute)

**Steps:**
1. Navigate to the **Stats** tab
2. **Show**:
   - Total documents indexed
   - Collection name
   - Embedding model information
3. Explain: "This shows how many document chunks are in the system"

### Part 5: Technical Deep Dive (2 minutes) - Optional

**Talking Points:**
- "Let me show you what's happening behind the scenes"
- Open browser DevTools Network tab
- Ask another question
- **Show**: 
  - API request to `/api/query`
  - Request payload with question
  - Response with answer and sources

## Demo Questions by Document Type

### For Technical Documentation:
- "What are the main features?"
- "How do I install this?"
- "What are the system requirements?"

### For Research Papers:
- "What is the main finding?"
- "What methodology was used?"
- "What are the conclusions?"

### For Product Information:
- "What problem does this solve?"
- "Who is the target audience?"
- "What are the key benefits?"

## Advanced Demo Features

### 1. Multi-Document Queries
- Upload 2-3 related documents
- Ask a question that requires information from multiple sources
- Show how sources from different documents are retrieved

### 2. Source Verification
- Ask a question
- Show the answer
- Open the sources panel
- Read the actual text from the source
- Verify the answer matches the source

### 3. Handling Unknown Questions
- Ask a question completely unrelated to the documents
- Show how the system responds with "I don't know"
- Explain: "This prevents hallucinations"

## Common Demo Scenarios

### Scenario 1: Customer Support Use Case
**Setup**: Upload product documentation
**Demo**: 
- "How can I reset my password?"
- "What are the warranty terms?"
- Show how support teams can use this

### Scenario 2: Research Assistant
**Setup**: Upload research papers
**Demo**:
- "What were the key findings?"
- "Compare the methodologies"
- Show how researchers can quickly extract information

### Scenario 3: Internal Knowledge Base
**Setup**: Upload company policies
**Demo**:
- "What is the vacation policy?"
- "How do I submit expenses?"
- Show employee self-service use case

## Troubleshooting During Demo

### If backend is slow:
- "The system is processing thousands of vectors"
- "In production, this can be optimized with caching"

### If answer is not perfect:
- "The quality depends on document quality and chunk size"
- "This can be tuned for specific use cases"

### If connection fails:
- Keep a backup video/screenshots ready
- Explain the architecture while resolving

## Post-Demo Q&A

**Expected Questions:**

**Q: How accurate is it?**
A: Depends on document quality and relevance. We use semantic search to find the most relevant chunks, and GPT-3.5 generates answers based only on those sources.

**Q: Can it work with other languages?**
A: Yes! Both the embedding model and GPT support multiple languages. You'd just need to adjust the models.

**Q: What about data privacy?**
A: Documents are stored locally in ChromaDB. For production, you can use self-hosted models or ensure compliance with data policies.

**Q: How much does it cost?**
A: Main costs are Google Gemini API calls (input + output tokens). You can use local models to eliminate API costs.

**Q: Can it scale?**
A: Yes! ChromaDB can be deployed in client-server mode, and the backend can be scaled horizontally.

**Q: What file types are supported?**
A: Currently PDF and TXT. Easy to add more with LangChain's document loaders (DOCX, HTML, CSV, etc.).

## Tips for a Great Demo

1. **Practice beforehand**: Know your sample documents well
2. **Clear data between demos**: Use the "Clear All Documents" feature
3. **Prepare for slow responses**: Have talking points ready
4. **Show the code**: Briefly show the clean, readable codebase
5. **Emphasize practical use cases**: Connect features to real-world problems

## Recording the Demo

If creating a video demo:

1. **Set up screen recording** at 1080p
2. **Close unnecessary tabs** and applications
3. **Zoom in on text** when showing code or sources
4. **Use a script** but sound natural
5. **Add captions** for key features
6. **Keep it under 5 minutes** for attention span

## Demo Checklist

Before starting:
- [ ] Backend running and healthy
- [ ] Frontend running on localhost:3000
- [ ] Sample documents prepared
- [ ] Browser cache cleared
- [ ] DevTools closed (or ready to open)
- [ ] Tested upload and query flow
- [ ] Notes/script ready

Good luck with your demo! 🎬
