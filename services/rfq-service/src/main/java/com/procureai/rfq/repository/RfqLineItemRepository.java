package com.procureai.rfq.repository;

import com.procureai.rfq.entity.RfqLineItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RfqLineItemRepository extends JpaRepository<RfqLineItem, Long> {
}
