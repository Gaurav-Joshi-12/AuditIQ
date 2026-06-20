package com.auditiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueryResponse {
    private String answer;
    private List<MatchedAnomaly> matchedAnomalies;
    private boolean grounded;
    private String message;
}
