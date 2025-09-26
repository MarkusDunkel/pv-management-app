package com.pvmanagement.config;

import com.pvmanagement.domain.RoleName;
import com.pvmanagement.domain.UserAccount;
import com.pvmanagement.repository.RoleRepository;
import com.pvmanagement.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    public DataInitializer(RoleRepository roleRepository,
                           UserAccountRepository userAccountRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.info("Skipping admin bootstrap; set app.admin.email/password to create one.");
            return;
        }

        userAccountRepository.findByEmail(adminEmail.toLowerCase()).ifPresentOrElse(user -> {
            if (user.getRoles().stream().noneMatch(role -> role.getName() == RoleName.ROLE_ADMIN)) {
                roleRepository.findByName(RoleName.ROLE_ADMIN).ifPresent(role -> {
                    user.getRoles().add(role);
                    userAccountRepository.save(user);
                    log.info("Ensured {} has ROLE_ADMIN", adminEmail);
                });
            }
        }, () -> {
            var adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN not found"));
            var userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new IllegalStateException("ROLE_USER not found"));

            UserAccount account = new UserAccount();
            account.setEmail(adminEmail.toLowerCase());
            account.setDisplayName("Administrator");
            account.setPassword(passwordEncoder.encode(adminPassword));
            account.getRoles().add(adminRole);
            account.getRoles().add(userRole);
            userAccountRepository.save(account);
            log.info("Created default admin user {}", adminEmail);
        });
    }
}
