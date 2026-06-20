package com.auditiq.service;

import com.auditiq.model.Company;
import com.auditiq.model.Upload;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.text.DecimalFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Generates an HTML audit report using Thymeleaf and sends it via SMTP.
     */
    public void sendAuditReport(Upload upload, Company company, String recipientEmail, org.springframework.web.multipart.MultipartFile pdfAttachment) {
        log.info("Generating and sending audit report email for company {} to {}", company.getName(), recipientEmail);
        
        try {
            // 1. Prepare data for the Thymeleaf HTML template
            Context context = new Context();
            context.setVariable("companyName", company.getName());
            context.setVariable("fileName", upload.getFileName());
            context.setVariable("totalRows", upload.getTotalRows());
            context.setVariable("flaggedCount", upload.getFlaggedCount());
            
            // Calculate anomaly rate
            double rate = 0;
            if (upload.getTotalRows() != null && upload.getTotalRows() > 0) {
                rate = ((double) upload.getFlaggedCount() / upload.getTotalRows()) * 100;
            }
            DecimalFormat df = new DecimalFormat("0.00");
            context.setVariable("anomalyRate", df.format(rate) + "%");

            // 2. Process the HTML template (src/main/resources/templates/audit-report.html)
            String htmlBody = templateEngine.process("audit-report", context);

            // 3. Build and send the email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "AuditIQ Intelligence");
            helper.setTo(recipientEmail);
            helper.setSubject("New AuditIQ Report Available: " + company.getName());
            helper.setText(htmlBody, true); // true indicates HTML content

            if (pdfAttachment != null && !pdfAttachment.isEmpty()) {
                helper.addAttachment("AuditIQ_Insights_Report.pdf", pdfAttachment);
            }

            mailSender.send(message);
            log.info("Audit report email successfully sent to {}", recipientEmail);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send audit report email", e);
            throw new RuntimeException("Failed to send audit report email: " + e.getMessage());
        }
    }
}
