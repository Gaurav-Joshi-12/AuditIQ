package com.auditiq.service;

import com.auditiq.dto.request.QueryRequest;
import com.auditiq.dto.response.MatchedAnomaly;
import com.auditiq.dto.response.QueryResponse;
import com.auditiq.model.AnomalyResult;
import com.auditiq.model.Transaction;
import com.auditiq.repository.AnomalyResultRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class QueryService {

    private final EmbeddingService embeddingService;
    private final AnomalyResultRepository anomalyResultRepository;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    public QueryService(EmbeddingService embeddingService, 
                        AnomalyResultRepository anomalyResultRepository,
                        RestTemplate restTemplate) {
        this.embeddingService = embeddingService;
        this.anomalyResultRepository = anomalyResultRepository;
        this.restTemplate = restTemplate;
    }

    public QueryResponse handle(QueryRequest request) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return QueryResponse.builder()
                    .answer(null)
                    .matchedAnomalies(Collections.emptyList())
                    .grounded(false)
                    .message("RAG query layer is not yet configured. Add gemini.api.key to application.properties to enable this feature.")
                    .build();
        }

        // 1. Embed the user's natural language query
        String queryVector = embeddingService.embed(request.getQuery());
        if (queryVector == null) {
            return QueryResponse.builder()
                    .answer(null)
                    .matchedAnomalies(Collections.emptyList())
                    .grounded(false)
                    .message("Failed to generate embedding for the query. Please check API limits or configuration.")
                    .build();
        }

        // 2. Retrieve similar anomalies using pgvector
        List<AnomalyResult> similarAnomalies;
        if (request.getUploadId() != null) {
            similarAnomalies = anomalyResultRepository.findSimilarByUpload(
                    queryVector, request.getUploadId(), 10
            );
        } else {
            similarAnomalies = anomalyResultRepository.findSimilar(
                    queryVector, request.getCompanyId(), 10
            );
        }

        if (similarAnomalies.isEmpty()) {
            return QueryResponse.builder()
                    .answer("No relevant anomalies found in the database for your query.")
                    .matchedAnomalies(Collections.emptyList())
                    .grounded(true)
                    .build();
        }

        // 3. Build context string
        String contextData = similarAnomalies.stream()
                .map(this::buildContextString)
                .collect(Collectors.joining("\n\n"));

        // 4. Map to DTOs for response
        List<MatchedAnomaly> matchedDtos = similarAnomalies.stream()
                .map(this::toMatchedAnomaly)
                .collect(Collectors.toList());

        // 5. Call Gemini to generate the final answer
        String prompt = "You are an audit analytics assistant. Answer the user's question using ONLY the audit data provided below. " +
                        "Be specific and cite transaction IDs and amounts. If the data doesn't contain a clear answer, say so honestly.\n\n" +
                        "AUDIT DATA:\n" + contextData + "\n\n" +
                        "USER QUESTION: " + request.getQuery();

        String answer = generateAnswer(prompt);

        if (answer == null) {
            return QueryResponse.builder()
                    .answer("Failed to generate an answer from the LLM. However, we found relevant records.")
                    .matchedAnomalies(matchedDtos)
                    .grounded(true)
                    .message("Gemini API generation failed.")
                    .build();
        }

        return QueryResponse.builder()
                .answer(answer)
                .matchedAnomalies(matchedDtos)
                .grounded(true)
                .build();
    }

    private String generateAnswer(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
            "contents", Collections.singletonList(Map.of(
                "parts", Collections.singletonList(Map.of("text", prompt))
            ))
        );

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, requestEntity, Map.class);

            if (response != null && response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null && content.containsKey("parts")) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (!parts.isEmpty()) {
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
            }
            log.warn("Unexpected generation response structure from Gemini API: {}", response);
            return null;
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.error("Gemini API rate limit reached (429) while generating answer.");
            return "Gemini API rate limit reached, please try again shortly.";
        } catch (Exception e) {
            log.error("Failed to generate answer from Gemini API: {}", e.getMessage());
            return null;
        }
    }

    private String buildContextString(AnomalyResult a) {
        Transaction t = a.getTransaction();
        return String.format("Transaction ID: %s | Vendor: %s | Department: %s | Amount: Rs.%s | Date: %s | Category: %s | Severity: %s | Flags: %s | Explanation: %s",
                t.getTransactionId(), t.getVendorName(), t.getDepartment(), t.getAmount(),
                t.getTransactionDate(), t.getCategory(), a.getSeverity(), String.join(", ", a.getFlags()), a.getExplanation());
    }

    private MatchedAnomaly toMatchedAnomaly(AnomalyResult a) {
        Transaction t = a.getTransaction();
        return MatchedAnomaly.builder()
                .transactionId(t.getTransactionId())
                .vendorName(t.getVendorName())
                .amount(t.getAmount())
                .transactionDate(t.getTransactionDate())
                .flags(a.getFlags())
                .severity(a.getSeverity())
                .explanation(a.getExplanation())
                .build();
    }
}
