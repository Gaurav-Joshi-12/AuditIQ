package com.auditiq.controller;

import com.auditiq.model.Upload;
import com.auditiq.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    /** POST /api/uploads/upload?companyId=X  — process file through AI pipeline */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("companyId") Long companyId) {
        try {
            return ResponseEntity.ok(uploadService.handleUpload(file, companyId, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** GET /api/uploads/company/{id} — list all uploads for a company, newest first */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Upload>> getByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(uploadService.getByCompany(companyId));
    }

    /** GET /api/uploads/{uploadId}/status */
    @GetMapping("/{uploadId}/status")
    public ResponseEntity<?> getStatus(@PathVariable Long uploadId) {
        try {
            return ResponseEntity.ok(uploadService.getStatus(uploadId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** PATCH /api/uploads/{uploadId}/share — mark report as shared with org */
    @PatchMapping("/{uploadId}/share")
    public ResponseEntity<?> shareWithOrg(@PathVariable Long uploadId) {
        try {
            return ResponseEntity.ok(uploadService.shareWithOrg(uploadId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
