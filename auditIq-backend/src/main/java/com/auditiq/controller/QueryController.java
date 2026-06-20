package com.auditiq.controller;

import com.auditiq.dto.request.QueryRequest;
import com.auditiq.dto.response.QueryResponse;
import com.auditiq.service.QueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/query")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QueryController {

    private final QueryService queryService;

    @PostMapping
    public ResponseEntity<QueryResponse> query(@RequestBody QueryRequest request) {
        if (request.getQuery() == null || request.getQuery().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                QueryResponse.builder()
                    .grounded(false)
                    .message("Query text cannot be empty.")
                    .build()
            );
        }
        
        if (request.getCompanyId() == null) {
             return ResponseEntity.badRequest().body(
                QueryResponse.builder()
                    .grounded(false)
                    .message("companyId must be provided.")
                    .build()
            );
        }

        QueryResponse response = queryService.handle(request);
        return ResponseEntity.ok(response);
    }
}
