# Services and The Multi-Agent Pipeline

The Service layer contains the core business logic of our application.

## 1. The Multi-Agent Pipeline (`AuditPipelineService.java`)
When an Organization uploads a CSV file, `AuditPipelineService` coordinates the entire flow. It acts as the "Manager" for three distinct AI Agents:

### Agent 1: The Ingestion Agent (`DataIngestionAgent.java`)
- Reads the raw MultipartFile.
- Parses the CSV file line-by-line using `OpenCSV`.
- Cleans and converts string dates into valid SQL Timestamps.
- Saves raw `Transaction` objects to the PostgreSQL database.

### Agent 2: The Anomaly Detection Agent (`AnomalyDetectionAgent.java`)
- Scans through the newly saved transactions.
- Applies complex business rules (e.g., Flagging transactions over $100k, flagging weekend transactions, checking against an approved vendor list).
- Saves these flagged issues into the `AnomalyResult` table.

### Agent 3: The Vector Embedding Agent (`VectorEmbeddingAgent.java`)
- Gathers the detected anomalies.
- Calls the **Google Gemini Embeddings API** (`models/text-embedding-004`).
- Converts the textual explanation of the anomaly into a 768-dimensional mathematical vector.
- Saves this vector into the `embedding_text` column using `pgvector`. This enables the AI Chatbot to perform semantic searches later.

## 2. The RAG Query Service (`QueryService.java`)
This is the brain behind the Auditor's AI Chatbot.
- **Step 1:** The user asks a question (e.g., "Any huge weekend payments?").
- **Step 2:** The service converts this question into a mathematical vector using the Gemini Embeddings API.
- **Step 3:** It queries `pgvector` to find the top 5 anomalies that mathematically match the meaning of the question.
- **Step 4:** It formats these 5 anomalies into a block of text (The "Context").
- **Step 5:** It feeds the Context + The User's Question into the **Google Gemini LLM** (`gemini-1.5-flash`), with strict instructions to *only* use the provided context to answer the question. This prevents "hallucinations".
- **Step 6:** It returns the AI's natural language answer to the Controller.

## 3. Other Services
- **`AuthService.java`:** Handles password hashing and calls `JwtUtil` to generate tokens.
- **`ReportService.java`:** Aggregates database stats and uses `JavaMailSender` to send SMTP emails to clients with PDF attachments.
