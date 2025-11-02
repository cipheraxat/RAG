# RAG Chatbot – Interview Reference

## 1. Product Overview
- **Problem**: Knowledge workers need fast answers from company documents instead of manual lookups.
- **Solution**: A Retrieval-Augmented Generation (RAG) chatbot that ingests uploaded documents, stores vector embeddings, and answers queries with grounded references.
- **Users**: Internal support teams and analysts; assumption is a private deployment with authenticated access.
- **Value**: Cuts document search time, keeps a verifiable audit trail of sources, and supports iterative document expansion.

## 2. End-to-End Flow
1. User uploads documents from the frontend (`frontend/components/DocumentUpload.tsx`).
2. Frontend hits `api.uploadDocument` in `frontend/lib/api.ts`, which points to `/api/upload` (Next.js rewrite proxies to FastAPI on port 8000).
3. Backend (`backend/main.py`) saves raw files, indexes via `RAGService.load_and_index_document`, and Chroma persists vectors under `backend/chroma_db`.
4. Chat UI (`frontend/components/ChatInterface.tsx`) sends questions to `api.query` -> `POST /api/query`.
5. Backend retrieves top-K chunks, prompts Gemini using the retrieved context, and returns answer + sources payload defined by `QueryResponse`.
6. Frontend renders conversation (`MessageBubble.tsx`), supporting sources (`SourceCard.tsx`), and live stats (`StatsPanel.tsx`).

## 3. Architecture Cheat Sheet
- **Frontend**: Next.js 14 App Router + Tailwind. Uses `next.config.js` rewrites to proxy `/api/*` to the FastAPI backend.
- **Backend**: FastAPI (`backend/main.py`) exposing `/api/upload`, `/api/query`, `/api/stats`, `/api/clear`, `/api/health`.
- **Embedding / Vector Store**: HuggingFace `sentence-transformers/all-MiniLM-L6-v2` embeddings stored in Chroma persistent collection `rag_collection`.
- **LLM**: Gemini 2.5 Pro through `ChatGoogleGenerativeAI`; abstraction in `RAGService` allows provider swaps.
- **Persistence**: Raw uploads saved in `backend/uploads/`; embeddings persisted in `backend/chroma_db/`; PID files + logs in repo root.
- **Process Management**: `start.sh` wires dependencies, health-checks backend, and spawns both processes; `stop.sh` tears them down safely.

## 4. Critical Code Paths
- **FastAPI bootstrap (`backend/main.py`)**
  - Creates `RAGService` singleton, configures CORS, ensures upload folder exists.
  - `POST /api/upload`: validates file extension, streams to disk, calls `load_and_index_document`, returns chunk count.
  - `POST /api/query`: wraps `RAGService.query`, translating exceptions to HTTP 500.
  - `GET /api/stats`: exposes collection metadata for the stats panel.
  - `DELETE /api/clear`: drops and rebuilds the vector store (dev convenience feature).
- **Service layer (`backend/rag_service.py`)**
  - Initializes embeddings and Chroma once; keeps a cached `ChatGoogleGenerativeAI` client.
  - `load_and_index_document`: chooses loader (`PyPDFLoader` or `TextLoader`), applies `RecursiveCharacterTextSplitter` with `chunk_size=1000`, `overlap=200`, then upserts chunks.
  - `query`: short-circuits when no collection or LLM, executes similarity search, composes prompt via `ChatPromptTemplate`, invokes Gemini, attaches ordered relevance scores.
  - `get_collection_stats` / `clear_collection`: directly access underlying Chroma collection for counts and resets.
- **Frontend orchestrator (`frontend/app/page.tsx`)**
  - Manages `chat`, `upload`, `stats` tabs, toggling components without reloading state.
  - Hooks upload success to trigger stats refresh and redirect back to chat.
- **Networking helper (`frontend/lib/api.ts`)**
  - Centralizes Axios configuration, ensuring consistent payload shapes for query/upload/stats/clear/health calls.

## 5. Data Contracts at a Glance
| Payload | Producer | Consumer | Fields |
| --- | --- | --- | --- |
| `QueryRequest` | Frontend | `/api/query` | `question: string`, `k?: number` |
| `QueryResponse` | Backend | Frontend | `answer`, `sources[]`, `success` |
| `Source` | Backend | `SourceCard` | `id`, `content`, `metadata` (`source`, `page`, ...), `relevance_score` |
| `UploadResponse` | Backend | `DocumentUpload` | `success`, `message`, `filename`, `chunks` |
| `StatsResponse` | Backend | `StatsPanel` | `total_documents`, `collection_name`, `embedding_model` |

## 6. Frontend Deep Dive
- `app/layout.tsx` & `globals.css`: app shell, gradient background, Tailwind configuration.
- `app/page.tsx`: stateful tab controller; handles upload success callback.
- `components/DocumentUpload.tsx`
  - Accepts PDFs/TXTs, shows drag-and-drop UI, posts `FormData` via `api.uploadDocument`.
  - Displays success/error banners; triggers parent callback on completion.
- `components/ChatInterface.tsx`
  - Holds chat transcript in React state; posts queries via `api.query`.
  - Handles loading/error cases; renders `MessageBubble` for user/bot roles.
- `components/SourceCard.tsx`
  - Presents source metadata (file name, page number) with excerpt snippet; arranges cards in responsive grid.
- `components/StatsPanel.tsx`
  - Fetches collection stats on mount or when `refresh` counter changes; surfaces doc count and embedding model.
- `frontend/lib/api.ts`: Axios wrapper; rewrites base URL using `NEXT_PUBLIC_API_URL` and Next.js proxy rules.

## 7. Backend Deep Dive
- Environment: `.env` (copied from `.env.example`) stores `LLM_PROVIDER`, `GOOGLE_API_KEY`, `EMBEDDING_MODEL`, `LLM_MODEL`, `CHROMA_DB_PATH`.
- Dependencies (`requirements.txt`): FastAPI, Uvicorn, python-dotenv, langchain components, chromadb, google-generativeai, HuggingFace embeddings.
- `RAGService` lifecycle:
  - Constructor sets embeddings (`normalize_embeddings=True`) for cosine-friendly vectors.
  - `_initialize_vectorstore` ensures persistence; recreates collection on failure.
  - `_initialize_llm` normalizes Gemini model aliases and raises actionable errors when key missing or invalid.
  - `query` handles no-docs, no-LLM, quota-exceeded, and generic errors gracefully for frontend display.
- `start.sh`: creates venv, installs deps, waits on `/api/health`, starts backend + frontend, records PIDs.
- `stop.sh`: reads PID files, sends `kill`, removes stale PID files.

## 8. Key Features to Highlight
- **Document Upload Pipeline**: chunking, embedding, and persistence with first-answer latency under one second after ingest (on local hardware).
- **Grounded Responses**: answers carry inline citations; `SourceCard` surfaces supporting chunks for transparency.
- **Ops Friendliness**: health endpoint, PID tracking, structured logs in `backend.log` and `frontend.log`.
- **Configurable Providers**: environment toggles enable future support for OpenAI, Claude, or internal models.
- **Vector Store Reset**: `/api/clear` endpoint accelerates QA workflows when iterating on document sets.

## 9. Running Locally
- `./start.sh`: orchestrates backend/frontend startup; uses `curl` health check loop before launching frontend.
- Manual steps (if scripts unavailable): `python3 -m venv venv`, `pip install -r backend/requirements.txt`, `uvicorn backend.main:app`, `npm install`, `npm run dev`.
- Logs: `backend.log` (FastAPI + RAGService output), `frontend.log` (Next.js dev server).
- Cleanup: `./stop.sh` or `kill $(cat .backend.pid) $(cat .frontend.pid)`.

## 10. Testing and Quality
- Manual scenarios: multi-file ingest, repeated queries across sessions (ensures persistence), out-of-domain questions (evaluates hallucination handling).
- Proposed automation:
  - **Unit**: mock embeddings/LLM to assert prompt shape, error messages, chunk counts.
  - **Integration**: FastAPI `TestClient` exercising upload → query flow with temporary filesystem.
  - **Frontend**: React Testing Library for upload progress states and chat error surfaces.
  - **Load**: Locust or k6 to stress `/api/query` and observe latency under concurrent users.

## 11. Deployment Notes
- **Containers**: Multi-stage Dockerfile for backend (Python slim) and frontend (Next.js build + static export or SSR). Mount volume for `chroma_db`.
- **CI/CD**: GitHub Actions pipeline running lint/test, building images, pushing to registry, deploying to Kubernetes or serverless container.
- **Secrets**: store `GOOGLE_API_KEY` in secret manager; rotate via GitHub OIDC + cloud IAM.
- **Auth**: add JWT middleware (FastAPI dependency) and NextAuth.js on frontend for protected access.
- **Observability**: integrate Prometheus metrics, structured logging (JSON), and request tracing for production.

## 12. Interview Story Angles
- **Architecture Ownership**: highlight designing the document ingestion + retrieval pipeline, proxying Next.js to FastAPI, and centralizing config.
- **Performance Tuning**: mention experimentation with chunk sizes, overlap, relevance scoring, and caching opportunities (e.g., conversation-level memory).
- **Reliability**: discuss health checks, error messages for quota limits, and restart scripts (`start.sh`/`stop.sh`).
- **Security**: talk about current private-network assumption and roadmap for auth, rate limiting, and data encryption.
- **Future Enhancements**: streaming responses, job queue for large ingests, hybrid retrieval, evaluation harness.

## 13. Troubleshooting Playbook
- **Backend not starting**: check `backend.log`; ensure `.env` contains valid `GOOGLE_API_KEY`; verify venv activates (`source backend/venv/bin/activate`).
- **Queries return "No documents"**: confirm documents were indexed (`GET /api/stats` > 0) and Chroma path has files.
- **Gemini quota errors**: `RAGService.query` returns friendly message; swap API key or adjust plan.
- **CORS issues in prod**: tighten `allow_origins` in `main.py` and align with deployment hostname.
- **Vector reset**: call `/api/clear` then re-upload to rebuild embeddings.

## 14. Expanded Q&A Bank
**System Design**
- *Q: Why choose RAG over fine-tuning?* **A:** RAG keeps knowledge dynamic without retraining; lower cost, faster updates, controllable context window.
- *Q: How would you scale this to thousands of documents?* **A:** Move Chroma to managed vector DB, batch embeddings asynchronously, shard by tenant, add caching for hot questions.
- *Q: How is latency managed?* **A:** Heavy work is embedding at ingest time; query path performs vector search (milliseconds) plus Gemini call (~hundreds ms). Future work: cached embeddings, answer caching, streaming.

**Backend**
- *Q: What happens when the LLM is unavailable?* **A:** `RAGService.query` surfaces `llm_error` with actionable text so frontend displays a diagnostic instead of generic failure.
- *Q: How do you prevent invalid file uploads?* **A:** MIME/type guard in `/api/upload`; only PDF/TXT accepted, size limits can be added via FastAPI dependency.
- *Q: Why LangChain loaders instead of manual parsing?* **A:** Provides tested PDF/TXT parsing, consistent document interface, and integration with `RecursiveCharacterTextSplitter`.

**Frontend**
- *Q: How do you manage API base URLs?* **A:** `NEXT_PUBLIC_API_URL` env plus Next.js rewrite ensures local dev hits `localhost:8000`; production can target deployed API domain.
- *Q: How are errors surfaced to users?* **A:** Components set local error state from Axios exceptions and render inline alerts; we can extend with toast notifications.
- *Q: Could this support streaming responses?* **A:** Yes—replace Axios call with fetch + `ReadableStream` and expose backend streaming via FastAPI `StreamingResponse`.

**ML / Retrieval**
- *Q: Why this embedding model?* **A:** `all-MiniLM-L6-v2` balances speed and semantic accuracy with 384-d vectors; easy CPU deployment.
- *Q: How do you handle chunk overlap?* **A:** 200-character overlap preserves context across chunk boundaries, reducing boundary hallucinations.
- *Q: How would you improve relevance?* **A:** Add metadata filters, use rerankers (Cohere, Voyage), log feedback loops, and experiment with hybrid BM25 + dense retrieval.

**Operations**
- *Q: How do you observe system health?* **A:** `/api/health`, logs, stats endpoint; plan to add Prometheus exporters and structured application logs.
- *Q: How do you deploy updates safely?* **A:** Container images, CI/CD pipeline, blue-green deployment for backend, static assets on CDN for frontend.
- *Q: How do you secure API keys?* **A:** Keep `.env` out of source control via `.gitignore`; in production rely on secret managers and environment injection.

**Product / Impact**
- *Q: What metrics show success?* **A:** Time-to-answer reduction, usage frequency, user-rated answer quality, number of documents ingested.
- *Q: How do users trust answers?* **A:** Source cards with excerpts, planned feature for highlighted citations inside answer, and ability to open the referenced document.
- *Q: How would you support multiple departments?* **A:** Namespace collections per team, add access controls, and implement tagging for document segmentation.

**Behavioral Hooks**
- *Q: Describe a challenge and resolution.* **A:** Example: Gemini quota failures—introduced explicit error messaging and fallback path; communicated to stakeholders and rotated API keys.
- *Q: What did you learn from building this?* **A:** Importance of grounding outputs, invest in clean API contracts early, and treat observability as first-class to debug LLM pipelines.

## 15. Personal Contributions Prompt
Prepare specific anecdotes (e.g., "I designed the ingestion batching to cut embedding calls by 40%", "I implemented source citation rendering to reduce trust concerns"). Tie each to measurable impact when possible.

---
Keep this doc open during prep; rehearse a crisp 90-second project intro and several 30-second deep dives for architecture, retrieval, frontend UX, and operations.

## 4. Backend Deep Dive
- `main.py`
  - Initializes FastAPI, includes CORS middleware for the Next.js origin.
  - Endpoint `/api/health`: readiness probe used by `start.sh`.
  - Endpoint `/api/upload`: accepts multipart files, saves to disk, forwards to `ingest_document` service.
  - Endpoint `/api/chat`: receives JSON `{message, conversationId?, limit?}`, delegates to `generate_answer`.
- `rag_service.py`
  - `get_or_create_client()`: lazily initializes Chroma persistent client pointing at `CHROMA_DB_PATH`.
  - `ingest_document(path)`: splits documents into chunks, embeds via SentenceTransformers, upserts into Chroma collection.
  - `query_rag(message, top_k)`: retrieves candidates, synthesizes prompt with citations, calls Gemini through Google Generative AI SDK, returns answer and source metadata.
  - Implements fallbacks for empty results and sanitizes prompt construction to avoid hallucinated citations.
- Configuration: `.env` flags provider, LLM model, embedding model, and DB path. `requirements.txt` primes FastAPI, chromadb, google-generativeai, sentence-transformers, uvicorn.

## 5. Frontend Deep Dive
- `app/layout.tsx` & `globals.css`: global styling and Tailwind setup.
- `app/page.tsx`: orchestrates top-level layout, wires Chat and DocumentUpload.
- `components/DocumentUpload.tsx`
  - Uses file input + drag/drop, posts FormData to `/api/upload`
  - Shows optimistic status messages and handles progress states.
- `components/ChatInterface.tsx`
  - Manages message state with React hooks.
  - Calls `chat` helper in `frontend/lib/api.ts`, handles streaming-like updates (polling or awaited promise).
  - Renders conversation via `MessageBubble.tsx`.
- `components/SourceCard.tsx`
  - Lists excerpts, file names, confidence scores for each supporting document chunk.
- `components/StatsPanel.tsx`
  - Displays diagnostic info (latency, token usage, context size) returned by backend response metadata.
- API helper (`frontend/lib/api.ts`): centralizes fetch logic, throws typed errors, simplifies retry handling.

## 6. Key Features to Highlight
- **Document Upload Pipeline**: chunking, embedding, and storage with immediate availability for search.
- **Grounded Responses**: answers include references to exact document segments to reduce hallucinations.
- **Componentized UI**: modular React components support future UX iterations.
- **Health & Monitoring Hooks**: `/api/health`, structured logs, and stats payloads provide observability.
- **Configurable Providers**: environment-based switch for LLM provider and models.

## 7. Running Locally
- `./start.sh` spins up both servers, sets up virtualenv, installs dependencies, and tails health status.
- `.backend.pid` / `.frontend.pid` store running PIDs for `./stop.sh` cleanup.
- Backend default: `http://localhost:8000`, Frontend: `http://localhost:3000`.
- Logs: `backend.log`, `frontend.log` for debugging.

## 8. Testing and Quality
- Manual testing: upload mixed formats, multi-doc queries, long context questions.
- Suggested automation extensions:
  - Backend unit tests for `ingest_document` (verify chunk + embedding count) and `query_rag` (mock LLM, ensure prompt correctness).
  - Integration test simulating upload + chat roundtrip using FastAPI TestClient.
  - Frontend component tests for upload state machine and chat error handling (Jest/React Testing Library).

## 9. Deployment Notes
- Containerize backend + frontend using Docker multi-stage builds; leverage environment variables for keys.
- ChromaDB persistence volume needed for stateful deployments.
- Use CI/CD (GitHub Actions) to lint, test, and deploy; include secrets management (e.g., GitHub OIDC + GCP Secret Manager).
- Add API authentication (JWT or API key) before exposing publicly.

## 10. Interview Story Angles
- **Architecture Ownership**: Describe how you integrated vector search with generative models and structured the API for async workloads.
- **Performance Tuning**: Mention chunk sizing, embedding model trade-offs, caching (room for improvement), and pagination of sources.
- **Reliability**: Health endpoint, logging, and potential for observability stack (Prometheus/Grafana or OpenTelemetry).
- **Security**: API key management, upcoming auth controls, and data residency considerations.
- **Future Enhancements**:
  - Streaming token responses for faster perceived latency.
  - Incremental document ingestion pipeline and background jobs for large uploads.
  - Hybrid retrieval (sparse + dense) and re-ranking to improve answer quality.
  - Evaluation harness with synthetic Q/A sets to measure accuracy.

## 11. Rapid Q&A Cheat Sheet
| Topic | Talking Points |
| --- | --- |
| "How do you handle hallucinations?" | Cite retrieval grounding, reference cards, possible answer thresholding, and plan for human-in-loop review. |
| "Why ChromaDB?" | Lightweight, persistent local store, easy Python bindings; can swap for managed vector DB later (Pinecone, Weaviate). |
| "Scaling strategy?" | Container-based deployment, GPU-ready embedding service, autoscale with job queue for ingestion, CDN for frontend. |
| "What about security?" | Currently private network; plan for auth middleware, rate limiting, and secret rotation. |
| "Monitoring?" | Health endpoint, structured logs; next steps include metrics, tracing, synthetic probes. |

## 12. Personal Contributions Prompt
Prepare specific anecdotes (e.g., "I designed the ingestion batching to cut embedding calls by 40%", "I implemented source citation rendering to reduce trust concerns"). Tie each to measurable impact if available.

---
Keep this doc open during prep; rehearse a 90-second project intro and several 30-second deep dives for architecture, retrieval, and frontend UX.
