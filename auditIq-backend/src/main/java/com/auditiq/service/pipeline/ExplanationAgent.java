package com.auditiq.service.pipeline;

import com.auditiq.model.AnomalyResult;
import com.auditiq.model.Transaction;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ExplanationAgent {

    public void explain(List<AnomalyResult> anomalyResults) {
        for (AnomalyResult result : anomalyResults) {
            Transaction tx = result.getTransaction();
            List<String> explanations = new ArrayList<>();

            for (String flag : result.getFlags()) {
                switch (flag) {
                    case "ROUND_NUMBER":
                        explanations.add(String.format("Transaction amount ₹%s is a suspiciously round figure.", tx.getAmount()));
                        break;
                    case "DUPLICATE":
                        explanations.add(String.format("Duplicate payment detected — same vendor (%s) and amount within 48 hours.", tx.getVendorName()));
                        break;
                    case "HIGH_VALUE":
                        explanations.add("Transaction exceeds high-value threshold of ₹10,00,000.");
                        break;
                    case "UNKNOWN_VENDOR":
                        explanations.add(String.format("Vendor '%s' is not in the approved vendor master list.", tx.getVendorName()));
                        break;
                    case "WEEKEND_TIMING":
                        explanations.add(String.format("Transaction processed on a weekend (%s), outside normal business hours.", tx.getTransactionDate().toLocalDate()));
                        break;
                    case "STATISTICAL_OUTLIER":
                        explanations.add(String.format("Amount is %.2fσ away from the dataset mean — statistically unusual.", tx.getZScore()));
                        break;
                    case "SPLIT_TRANSACTION":
                        explanations.add(String.format("Multiple transactions to %s within 24hrs just below ₹10L — possible structuring.", tx.getVendorName()));
                        break;
                    case "BALANCE_MISMATCH":
                        explanations.add(String.format("Ledger balance inconsistency: balance before (₹%s) minus amount (₹%s) does not equal balance after (₹%s) — possible ledger integrity issue.", tx.getBalanceBefore(), tx.getAmount(), tx.getBalanceAfter()));
                        break;
                    case "MISSING_INVOICE":
                        explanations.add("No invoice number on file for this transaction — missing supporting documentation.");
                        break;
                }
            }

            result.setExplanation(String.join(" | ", explanations));
        }
    }
}
