package com.auditiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
    private Long uploadId;
    private String fileName;
    private String fileType;
    private Integer totalRows;
    private Integer flaggedCount;
    private String status;
}
