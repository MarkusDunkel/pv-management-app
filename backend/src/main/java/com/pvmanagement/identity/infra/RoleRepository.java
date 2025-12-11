package com.pvmanagement.identity.infra;

import com.pvmanagement.identity.domain.Role;
import com.pvmanagement.identity.domain.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
