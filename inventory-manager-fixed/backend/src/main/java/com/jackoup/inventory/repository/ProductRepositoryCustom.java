package com.jackoup.inventory.repository;

import com.jackoup.inventory.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

public interface ProductRepositoryCustom {

    Page<Product> searchProducts(String name, String category, Pageable pageable);

    List<Product> findAllMatchingSorted(String name, String category, Sort sort);
}
