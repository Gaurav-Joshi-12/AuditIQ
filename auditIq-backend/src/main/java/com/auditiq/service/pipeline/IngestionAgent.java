package com.auditiq.service.pipeline;

import com.auditiq.model.Transaction;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class IngestionAgent {

    public List<Transaction> parse(MultipartFile file, Long uploadId, String fileType) throws Exception {
        if ("CSV".equalsIgnoreCase(fileType)) {
            return parseCsv(file, uploadId);
        } else if ("XLSX".equalsIgnoreCase(fileType) || "XLS".equalsIgnoreCase(fileType)) {
            return parseExcel(file, uploadId);
        } else {
            throw new IllegalArgumentException("Unsupported file type: " + fileType);
        }
    }

    private List<Transaction> parseCsv(MultipartFile file, Long uploadId) throws Exception {
        List<Transaction> transactions = new ArrayList<>();
        try (Reader reader = new InputStreamReader(file.getInputStream())) {
            CSVReader csvReader = new CSVReaderBuilder(reader).withSkipLines(1).build();
            String[] nextLine;

            while ((nextLine = csvReader.readNext()) != null) {
                if (nextLine.length < 14) continue;

                String txId = nextLine[0].trim();
                String dateStr = nextLine[1].trim();
                String vendorId = nextLine[2].trim();
                String vendorName = nextLine[3].trim();
                String department = nextLine[4].trim();
                String approvedBy = nextLine[5].trim();
                String amountStr = nextLine[6].trim();
                String ledgerType = nextLine[7].trim();
                String category = nextLine[8].trim();
                String paymentMode = nextLine[9].trim();
                String balanceBeforeStr = nextLine[10].trim();
                String balanceAfterStr = nextLine[11].trim();
                String invoiceNumber = nextLine[12].trim();
                String isRecurringStr = nextLine[13].trim();

                BigDecimal amount = parseBigDecimal(amountStr);
                if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) continue;

                LocalDateTime date = parseDate(dateStr);
                if (date == null) continue;

                Transaction tx = Transaction.builder()
                        .uploadId(uploadId)
                        .transactionId(txId)
                        .transactionDate(date)
                        .vendorId(vendorId)
                        .vendorName(vendorName)
                        .department(department)
                        .approvedBy(approvedBy)
                        .amount(amount)
                        .ledgerType(ledgerType)
                        .category(category)
                        .paymentMode(paymentMode)
                        .balanceBefore(parseBigDecimal(balanceBeforeStr))
                        .balanceAfter(parseBigDecimal(balanceAfterStr))
                        .invoiceNumber(invoiceNumber == null || invoiceNumber.isBlank() ? null : invoiceNumber)
                        .isRecurring("TRUE".equalsIgnoreCase(isRecurringStr))
                        .build();

                transactions.add(tx);
            }
        }
        return transactions;
    }

    private List<Transaction> parseExcel(MultipartFile file, Long uploadId) throws Exception {
        List<Transaction> transactions = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            Row headerRow = sheet.getRow(0);
            if (headerRow == null) return transactions;

            // Map columns by header name
            int txIdIdx = -1, dateIdx = -1, vendorIdIdx = -1, vendorNameIdx = -1, deptIdx = -1;
            int approvedByIdx = -1, amountIdx = -1, ledgerTypeIdx = -1, categoryIdx = -1;
            int paymentModeIdx = -1, balBeforeIdx = -1, balAfterIdx = -1, invNumIdx = -1, isRecurringIdx = -1;

            for (Cell cell : headerRow) {
                String header = cell.getStringCellValue().trim().toLowerCase();
                switch (header) {
                    case "transaction_id": txIdIdx = cell.getColumnIndex(); break;
                    case "date": dateIdx = cell.getColumnIndex(); break;
                    case "vendor_id": vendorIdIdx = cell.getColumnIndex(); break;
                    case "vendor_name": vendorNameIdx = cell.getColumnIndex(); break;
                    case "department": deptIdx = cell.getColumnIndex(); break;
                    case "approved_by": approvedByIdx = cell.getColumnIndex(); break;
                    case "amount": amountIdx = cell.getColumnIndex(); break;
                    case "ledger_type": ledgerTypeIdx = cell.getColumnIndex(); break;
                    case "category": categoryIdx = cell.getColumnIndex(); break;
                    case "payment_mode": paymentModeIdx = cell.getColumnIndex(); break;
                    case "balance_before": balBeforeIdx = cell.getColumnIndex(); break;
                    case "balance_after": balAfterIdx = cell.getColumnIndex(); break;
                    case "invoice_number": 
                    case "invoice_num": invNumIdx = cell.getColumnIndex(); break;
                    case "is_recurring": isRecurringIdx = cell.getColumnIndex(); break;
                }
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                BigDecimal amount = getNumericCellAsBigDecimal(row.getCell(amountIdx));
                if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) continue;

                LocalDateTime date = getDateCellAsLocalDateTime(row.getCell(dateIdx));
                if (date == null) continue;

                String invoiceNumber = getStringCellValue(row.getCell(invNumIdx));

                Transaction tx = Transaction.builder()
                        .uploadId(uploadId)
                        .transactionId(getStringCellValue(row.getCell(txIdIdx)))
                        .transactionDate(date)
                        .vendorId(getStringCellValue(row.getCell(vendorIdIdx)))
                        .vendorName(getStringCellValue(row.getCell(vendorNameIdx)))
                        .department(getStringCellValue(row.getCell(deptIdx)))
                        .approvedBy(getStringCellValue(row.getCell(approvedByIdx)))
                        .amount(amount)
                        .ledgerType(getStringCellValue(row.getCell(ledgerTypeIdx)))
                        .category(getStringCellValue(row.getCell(categoryIdx)))
                        .paymentMode(getStringCellValue(row.getCell(paymentModeIdx)))
                        .balanceBefore(getNumericCellAsBigDecimal(row.getCell(balBeforeIdx)))
                        .balanceAfter(getNumericCellAsBigDecimal(row.getCell(balAfterIdx)))
                        .invoiceNumber(invoiceNumber == null || invoiceNumber.isBlank() ? null : invoiceNumber)
                        .isRecurring(getBooleanCellValue(row.getCell(isRecurringIdx)))
                        .build();

                transactions.add(tx);
            }
        }
        return transactions;
    }

    private BigDecimal parseBigDecimal(String str) {
        if (str == null || str.isBlank()) return null;
        try {
            return new BigDecimal(str.replace(",", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("M/d/yy"),
            DateTimeFormatter.ofPattern("M/d/yyyy"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy")
    );

    private LocalDateTime parseDate(String str) {
        if (str == null || str.isBlank()) return null;
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(str, formatter).atStartOfDay();
            } catch (DateTimeParseException e) {
                // Ignore and try the next formatter
            }
        }
        return null;
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf(cell.getNumericCellValue());
        }
        return null;
    }

    private BigDecimal getNumericCellAsBigDecimal(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            return parseBigDecimal(cell.getStringCellValue().trim());
        }
        return null;
    }

    private LocalDateTime getDateCellAsLocalDateTime(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            return parseDate(cell.getStringCellValue().trim());
        }
        return null;
    }

    private Boolean getBooleanCellValue(Cell cell) {
        if (cell == null) return false;
        if (cell.getCellType() == CellType.BOOLEAN) {
            return cell.getBooleanCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            return "TRUE".equalsIgnoreCase(cell.getStringCellValue().trim());
        }
        return false;
    }
}
