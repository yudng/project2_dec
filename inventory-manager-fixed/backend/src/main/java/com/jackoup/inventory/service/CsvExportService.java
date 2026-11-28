package com.jackoup.inventory.service;

import com.jackoup.inventory.model.Product;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class CsvExportService {

    private static final byte[] UTF8_BOM = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};

    public byte[] exportProductsToCsv(List<Product> products) {
        StringBuilder sb = new StringBuilder();
        sb.append("SKU,Name,Category,Quantity,Price,Value,Status\r\n");
        for (Product p : products) {
            BigDecimal totalValue = p.getPrice()
                    .multiply(BigDecimal.valueOf(p.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            sb.append(formatCell(p.getSku())).append(',')
                    .append(formatCell(p.getName())).append(',')
                    .append(formatCell(p.getCategory() != null ? p.getCategory() : "")).append(',')
                    .append(p.getQuantity()).append(',')
                    .append(p.getPrice().setScale(2, RoundingMode.HALF_UP)).append(',')
                    .append(totalValue).append(',')
                    .append(formatCell(resolveStatusLabel(p)))
                    .append("\r\n");
        }
        byte[] content = sb.toString().getBytes(StandardCharsets.UTF_8);
        byte[] withBom = new byte[UTF8_BOM.length + content.length];
        System.arraycopy(UTF8_BOM, 0, withBom, 0, UTF8_BOM.length);
        System.arraycopy(content, 0, withBom, UTF8_BOM.length, content.length);
        return withBom;
    }

    public String resolveStatusLabel(Product p) {
        if (p.getQuantity() == 0) {
            return "Out of stock";
        }
        if (p.getQuantity() <= p.getLowStockThreshold()) {
            return "Low stock";
        }
        return "In stock";
    }

    String formatCell(String raw) {
        if (raw == null) {
            return "";
        }
        String sanitized = neutralizeFormulaInjection(raw);
        boolean needsQuotes = sanitized.contains(",")
                || sanitized.contains("\"")
                || sanitized.contains("\n")
                || sanitized.contains("\r");
        if (!needsQuotes) {
            return sanitized;
        }
        return "\"" + sanitized.replace("\"", "\"\"") + "\"";
    }

    private String neutralizeFormulaInjection(String value) {
        if (value.isEmpty()) {
            return value;
        }
        char first = value.charAt(0);
        if (first == '=' || first == '+' || first == '-' || first == '@' || first == '\t' || first == '\r') {
            return "'" + value;
        }
        return value;
    }
}
