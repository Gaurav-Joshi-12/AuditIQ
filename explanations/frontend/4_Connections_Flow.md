# The Complete End-to-End Connection Flow

Let's trace exactly how a user action on the frontend reaches the database.

## Example Scenario: Auditor queries the AI Chatbot

1. **User Interaction:** The Auditor types "Are there duplicate payments?" and clicks Send in `AIChatbot.tsx`.
2. **Local State Update:** `setInput('')` clears the box, and `addChatMessage` instantly puts the user's message on the screen.
3. **API Call:** The component fires `api.post('/api/query', { query: input, companyId: id })`.
4. **Axios Interceptor:** Axios automatically attaches the Auditor's JWT token to the headers.
5. **Network Request:** The HTTP POST request flies across the network to port `8082`.
6. **Backend Entry:** Tomcat (the embedded web server in Spring Boot) receives the request.
7. **Security Filter:** The `JwtFilter` intercepts it. It extracts the token, verifies the cryptographic signature using the secret key, and tells Spring Security "This is a valid Auditor".
8. **Controller:** The request hits `QueryController.java`. The JSON body is deserialized into a `QueryRequest` DTO object.
9. **Service Layer:** The controller passes the request to `QueryService.java`.
   - The service hits the Gemini Embeddings API to convert the text into a vector.
   - It calls the `AnomalyResultRepository` to perform a Cosine Similarity Search (`<=>`) in the `pgvector` database.
   - It packages the relevant database rows into a prompt.
   - It calls the Gemini LLM API to get a natural language answer.
10. **Response:** The service builds a `QueryResponse` DTO and returns it to the Controller, which converts it to JSON and sends it back to the browser.
11. **Frontend Receives Data:** The `await api.post(...)` promise resolves in React.
12. **Final Render:** The frontend takes the AI's answer, creates an `assistantMsg` object, and adds it to the Zustand store. React re-renders the chat window to show the AI's response.
