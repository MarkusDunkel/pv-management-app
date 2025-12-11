package com.pvmanagement.demoAccess.infra;

import com.pvmanagement.demoAccess.domain.DemoRedemption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemoRedemptionRepository extends JpaRepository<DemoRedemption, Long> {
}
