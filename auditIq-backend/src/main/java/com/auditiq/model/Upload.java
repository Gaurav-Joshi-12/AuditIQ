package com.auditiq.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "upload")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Upload {

    // private String uploadId;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "upload_id")
    private Long uploadId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User uploadedBy;

    private String fileName;

    // CSV or XLSX
    private String fileType;

    // PENDING, PROCESSING, DONE, FAILED
    private String status;

    private Integer totalRows;

    private Integer flaggedCount;

    private LocalDateTime uploadedAt;

    @Builder.Default
    private Boolean sharedWithOrg = false;
}
