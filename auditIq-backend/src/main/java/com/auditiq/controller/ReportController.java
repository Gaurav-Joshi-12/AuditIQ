package com.auditiq.controller;

import com.auditiq.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /** GET /api/reports/company/{companyId} — full summary for Auditor Dashboard KPIs */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getCompanySummary(@PathVariable Long companyId) {
        return ResponseEntity.ok(reportService.getSummary(companyId));
    }

    /** GET /api/reports/upload/{uploadId} — aggregated metrics for one upload */
    @GetMapping("/upload/{uploadId}")
    public ResponseEntity<?> getUploadReport(@PathVariable Long uploadId) {
        return ResponseEntity.ok(reportService.getUploadReport(uploadId));
    }
}
