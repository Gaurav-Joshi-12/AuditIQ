package com.auditiq.service;

import com.auditiq.dto.response.PipelineResult;
import com.auditiq.dto.response.UploadResponse;
import com.auditiq.model.Company;
import com.auditiq.model.Upload;
import com.auditiq.repository.CompanyRepository;
import com.auditiq.repository.UploadRepository;
import com.auditiq.service.pipeline.AuditPipelineCoordinator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final UploadRepository uploadRepository;
    private final CompanyRepository companyRepository;
    private final AuditPipelineCoordinator pipelineCoordinator;

    public UploadResponse handleUpload(MultipartFile file, Long companyId, Long userId) {
        String originalFilename = file.getOriginalFilename();
        String fileType = "CSV";
        if (originalFilename != null && (originalFilename.toLowerCase().endsWith(".xlsx") || originalFilename.toLowerCase().endsWith(".xls"))) {
            fileType = "XLSX";
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));

        Upload upload = Upload.builder()
                .company(company)
                .fileName(originalFilename)
                .fileType(fileType)
                .status("PENDING")
                .uploadedAt(LocalDateTime.now())
                .build();

        upload = uploadRepository.save(upload);
        Long uploadId = upload.getUploadId();

        try {
            upload.setStatus("PROCESSING");
            uploadRepository.save(upload);

            PipelineResult result = pipelineCoordinator.run(file, uploadId, companyId, fileType);

            upload.setTotalRows(result.getTotalRows());
            upload.setFlaggedCount(result.getFlaggedCount());
            upload.setStatus("DONE");
            uploadRepository.save(upload);

            return UploadResponse.builder()
                    .uploadId(uploadId)
                    .fileName(upload.getFileName())
                    .fileType(upload.getFileType())
                    .totalRows(upload.getTotalRows())
                    .flaggedCount(upload.getFlaggedCount())
                    .status(upload.getStatus())
                    .build();

        } catch (Exception e) {
            log.error("Pipeline failed for upload {}", uploadId, e);
            upload.setStatus("FAILED");
            uploadRepository.save(upload);

            Throwable root = e;
            while (root.getCause() != null && root.getCause() != root) {
                root = root.getCause();
            }
            throw new RuntimeException("Upload processing failed: " + root.getMessage(), e);
        }
    }

    public List<Upload> getByCompany(Long companyId) {
        return uploadRepository.findByCompanyIdOrderByUploadedAtDesc(companyId);
    }

    public Upload getStatus(Long uploadId) {
        return uploadRepository.findById(uploadId)
                .orElseThrow(() -> new IllegalArgumentException("Upload not found: " + uploadId));
    }

    public Upload shareWithOrg(Long uploadId) {
        Upload upload = uploadRepository.findById(uploadId)
                .orElseThrow(() -> new IllegalArgumentException("Upload not found: " + uploadId));
        upload.setSharedWithOrg(true);
        return uploadRepository.save(upload);
    }
}
