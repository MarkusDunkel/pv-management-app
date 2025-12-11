package com.pvmanagement.auth.infra;

import com.pvmanagement.auth.domain.RefreshToken;
import com.pvmanagement.identity.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(UserAccount user);

    long deleteByExpiresAtBefore(Instant cutoff);
}
