package com.jackoup.inventory.repository;

import com.jackoup.inventory.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p " +
            "WHERE (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:category IS NULL OR p.category = :category)")
    Page<Product> search(@Param("name") String name,
                         @Param("category") String category,
                         Pageable pageable);

    boolean existsBySku(String sku);

    @Query("SELECT SUM(p.quantity * p.price) FROM Product p")
    BigDecimal getTotalInventoryValue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantity <= p.lowStockThreshold")
    long countLowStock();

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL ORDER BY p.category")
    List<String> findDistinctCategories();
}
