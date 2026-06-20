package com.auditiq.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transaction")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    // private UUID id;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Matches Upload PK
    private Long uploadId;

    @Column(name = "transaction_id")
    private String transactionId;

    // e.g. V-501
    private String vendorId;

    private String vendorName;

    // e.g. Procurement, Finance, Operations, HR
    private String department;

    // e.g. "R. Sharma"
    private String approvedBy;

    private BigDecimal amount;

    private LocalDateTime transactionDate;

    // Purchase Ledger / General Ledger / Sales Ledger
    private String ledgerType;

    // Raw Materials, Engine Parts, Maintenance, Logistics
    private String category;

    // NEFT, RTGS, Cheque
    private String paymentMode;

    private BigDecimal balanceBefore;

    private BigDecimal balanceAfter;

    // nullable — some rows have blank invoice numbers
    private String invoiceNumber;

    private Boolean isRecurring;

    // Set by PreprocessingAgent
    private Double zScore;

    @Builder.Default
    private String currency = "INR";

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upload_fk")
    private Upload upload;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
}
