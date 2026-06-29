package com.procureai.procurement.repository;

import com.procureai.procurement.entity.PurchaseRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRequestItemRepository extends JpaRepository<PurchaseRequestItem, Long> {
}
