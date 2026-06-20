package com.auditiq.dto.response;

import com.auditiq.model.AnomalyResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PipelineResult {
    private Integer totalRows;
    private Integer flaggedCount;
    private List<AnomalyResult> anomalyResults;
}
