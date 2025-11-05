package com.pvmanagement.repository;

import com.pvmanagement.domain.DemoKey;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface DemoKeyRepository extends JpaRepository<DemoKey, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<DemoKey> findByKeyIdAndOrg(String keyId, String org);

    Optional<DemoKey> findByKeyId(String keyId);
}
