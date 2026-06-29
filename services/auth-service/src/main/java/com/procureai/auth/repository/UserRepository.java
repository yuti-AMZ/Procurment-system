package com.procureai.auth.repository;

import com.procureai.auth.entity.AccountStatus;
import com.procureai.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByEmailVerificationToken(String token);
    Optional<User> findByOauthProviderAndOauthId(String provider, String oauthId);
    List<User> findByAccountStatus(AccountStatus accountStatus);
    long countByAccountStatus(AccountStatus accountStatus);
}
