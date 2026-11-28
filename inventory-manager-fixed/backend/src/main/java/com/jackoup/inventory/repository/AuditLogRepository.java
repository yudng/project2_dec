package com.jackoup.inventory.repository;

import com.jackoup.inventory.model.AuditAction;
import com.jackoup.inventory.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a " +
            "WHERE (:action IS NULL OR a.action = :action) " +
            "AND (:keyword IS NULL OR LOWER(a.actor) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(a.productSku) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(a.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(a.details) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY a.createdAt DESC, a.id DESC")
    Page<AuditLog> search(
            @Param("action") AuditAction action,
            @Param("keyword") String keyword,
            Pageable pageable);
}
