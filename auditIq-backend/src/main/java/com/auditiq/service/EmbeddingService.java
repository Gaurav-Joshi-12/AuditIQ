package com.auditiq.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EmbeddingService {

    private final RestTemplate restTemplate;
    
    @Value("${gemini.api.key:}")
    private String apiKey;
    
    @Value("${gemini.embedding.model:text-embedding-004}")
    private String embeddingModel;

    public EmbeddingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String embed(String text) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API key is not configured. Skipping embedding generation.");
            return null;
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" 
                + embeddingModel + ":embedContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
            "model", "models/" + embeddingModel,
            "content", Map.of(
                "parts", Collections.singletonList(Map.of("text", text))
            ),
            "outputDimensionality", 768
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            
            if (response != null && response.containsKey("embedding")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> embedding = (Map<String, Object>) response.get("embedding");
                if (embedding.containsKey("values")) {
                    @SuppressWarnings("unchecked")
                    List<Double> values = (List<Double>) embedding.get("values");
                    
                    // Convert List<Double> to Postgres vector literal string format e.g. "[0.123, -0.456]"
                    return "[" + values.stream()
                                       .map(String::valueOf)
                                       .collect(Collectors.joining(",")) + "]";
                }
            }
            log.warn("Unexpected response structure from Gemini API: {}", response);
            return null;

        } catch (HttpClientErrorException.TooManyRequests e) {
            log.error("Gemini API rate limit reached (429) while generating embedding.");
            return null;
        } catch (Exception e) {
            log.error("Failed to generate embedding from Gemini API: {}", e.getMessage());
            return null;
        }
    }
}
