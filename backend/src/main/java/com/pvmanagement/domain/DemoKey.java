package com.pvmanagement.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "demo_keys",
       uniqueConstraints = @UniqueConstraint(name = "uk_demo_keys_key_org", columnNames = {"key_id", "org"}))
@Getter
@Setter
@NoArgsConstructor
public class DemoKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key_id", nullable = false)
    private String keyId;

    @Column(nullable = false)
    private String org;

    @Column(name = "issued_at")
    private OffsetDateTime issuedAt;

    @Column(name = "first_used_at")
    private OffsetDateTime firstUsedAt;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(nullable = false)
    private int activations = 0;

    @Column(name = "max_activations", nullable = false)
    private int maxActivations = 5;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(name = "last_used_at")
    private OffsetDateTime lastUsedAt;
}
