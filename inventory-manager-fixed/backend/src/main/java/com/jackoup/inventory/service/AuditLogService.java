package com.jackoup.inventory.service;

import com.jackoup.inventory.model.AuditAction;
import com.jackoup.inventory.model.AuditLog;
import com.jackoup.inventory.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLog record(
            String actor,
            AuditAction action,
            Long entityId,
            String productSku,
            String productName,
            String details) {
        String safeActor = (actor == null || actor.isBlank()) ? "system" : actor.trim();
        AuditLog log = new AuditLog(
                safeActor,
                action,
                "PRODUCT",
                entityId,
                productSku,
                productName,
                truncate(details, 1000),
                Instant.now());
        return auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(AuditAction action, String keyword, Pageable pageable) {
        String normalizedKeyword = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return auditLogRepository.search(action, normalizedKeyword, pageable);
    }

    private String truncate(String text, int maxLen) {
        if (text == null) {
            return "";
        }
        return text.length() <= maxLen ? text : text.substring(0, maxLen - 3) + "...";
    }
}
