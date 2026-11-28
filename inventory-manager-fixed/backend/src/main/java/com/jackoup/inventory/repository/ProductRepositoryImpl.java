package com.jackoup.inventory.repository;

import com.jackoup.inventory.model.Product;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ProductRepositoryImpl implements ProductRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<Product> searchProducts(String name, String category, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<Product> query = cb.createQuery(Product.class);
        Root<Product> root = query.from(Product.class);
        List<Predicate> predicates = buildPredicates(cb, root, name, category);
        query.where(predicates.toArray(Predicate[]::new));
        query.orderBy(buildOrders(cb, root, pageable.getSort()));

        TypedQuery<Product> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        List<Product> content = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Product> countRoot = countQuery.from(Product.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, name, category);
        countQuery.select(cb.count(countRoot));
        countQuery.where(countPredicates.toArray(Predicate[]::new));
        long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    @Override
    public List<Product> findAllMatchingSorted(String name, String category, Sort sort) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Product> query = cb.createQuery(Product.class);
        Root<Product> root = query.from(Product.class);
        List<Predicate> predicates = buildPredicates(cb, root, name, category);
        query.where(predicates.toArray(Predicate[]::new));
        query.orderBy(buildOrders(cb, root, sort));
        return entityManager.createQuery(query).getResultList();
    }

    private List<Predicate> buildPredicates(
            CriteriaBuilder cb,
            Root<Product> root,
            String name,
            String category) {
        List<Predicate> predicates = new ArrayList<>();
        if (name != null && !name.isBlank()) {
            String pattern = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
            predicates.add(cb.like(cb.lower(root.get("name")), pattern));
        }
        if (category != null && !category.isBlank()) {
            predicates.add(cb.equal(root.get("category"), category.trim()));
        }
        return predicates;
    }

    private List<Order> buildOrders(CriteriaBuilder cb, Root<Product> root, Sort sort) {
        List<Order> orders = new ArrayList<>();
        if (sort != null && sort.isSorted()) {
            for (Sort.Order order : sort) {
                Expression<?> expr = resolveSortExpression(cb, root, order.getProperty());
                orders.add(order.isAscending() ? cb.asc(expr) : cb.desc(expr));
            }
        } else {
            orders.add(cb.asc(root.get("name")));
        }
        orders.add(cb.asc(root.get("id")));
        return orders;
    }

    private Expression<?> resolveSortExpression(CriteriaBuilder cb, Root<Product> root, String property) {
        if ("value".equals(property)) {
            return cb.prod(cb.toBigDecimal(root.get("quantity")), root.get("price"));
        }
        return root.get(property);
    }
}
