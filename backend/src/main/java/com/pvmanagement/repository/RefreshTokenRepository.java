package com.pvmanagement.repository;

import com.pvmanagement.domain.RefreshToken;
import com.pvmanagement.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(UserAccount user);

    long deleteByExpiresAtBefore(Instant cutoff);
}
