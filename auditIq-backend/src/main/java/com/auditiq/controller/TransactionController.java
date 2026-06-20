package com.auditiq.controller;

import com.auditiq.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/upload/{uploadId}")
    public ResponseEntity<?> getByUpload(@PathVariable Long uploadId) {
        return ResponseEntity.ok(transactionService.getByUpload(uploadId));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getByCompany(@PathVariable Long companyId,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(transactionService.getByCompany(companyId, PageRequest.of(page, size)));
    }

    @GetMapping("/upload/{uploadId}/{txId}")
    public ResponseEntity<?> getSingleTransaction(@PathVariable Long uploadId, @PathVariable Long txId) {
        return ResponseEntity.ok(transactionService.getTransaction(txId));
    }
}
