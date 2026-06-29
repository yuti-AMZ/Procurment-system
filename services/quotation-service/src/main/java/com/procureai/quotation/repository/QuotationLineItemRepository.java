package com.procureai.quotation.repository;

import com.procureai.quotation.entity.QuotationLineItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuotationLineItemRepository extends JpaRepository<QuotationLineItem, Long> {
}
