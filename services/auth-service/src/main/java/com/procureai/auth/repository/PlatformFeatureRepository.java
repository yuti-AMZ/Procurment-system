package com.procureai.auth.repository;
import com.procureai.auth.entity.PlatformFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PlatformFeatureRepository extends JpaRepository<PlatformFeature, Long> {
    Optional<PlatformFeature> findByFeatureKey(String featureKey);
    List<PlatformFeature> findByCategory(String category);
    List<PlatformFeature> findByEnabledTrue();
}
