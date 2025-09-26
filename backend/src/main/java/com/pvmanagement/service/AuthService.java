package com.pvmanagement.service;

import com.pvmanagement.domain.RoleName;
import com.pvmanagement.domain.UserAccount;
import com.pvmanagement.dto.AuthRequest;
import com.pvmanagement.dto.AuthResponse;
import com.pvmanagement.dto.RegisterRequest;
import com.pvmanagement.dto.UserProfileDto;
import com.pvmanagement.repository.RoleRepository;
import com.pvmanagement.repository.UserAccountRepository;
import com.pvmanagement.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserAccountRepository userAccountRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userAccountRepository = userAccountRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userAccountRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }

        var user = new UserAccount();
        user.setEmail(request.email().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName());

        var role = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException("ROLE_USER not seeded"));

        user.getRoles().add(role);
        var saved = userAccountRepository.save(user);

        return buildAuthResponse(saved);
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        var user = userAccountRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new IllegalStateException("User not found after authentication"));
        return buildAuthResponse(user);
    }

    public UserProfileDto profile(String email) {
        var user = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        var roles = user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());
        return new UserProfileDto(user.getId(), user.getEmail(), user.getDisplayName(), user.isEnabled(),
                user.isEmailVerified(), user.getCreatedAt(), roles);
    }

    private AuthResponse buildAuthResponse(UserAccount user) {
        var roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
        String token = jwtService.generateToken(user.getEmail(), roles, Map.of("displayName", user.getDisplayName()));
        Instant expiresAt = jwtService.extractExpiry(token);
        return new AuthResponse(token, expiresAt, roles, user.getDisplayName(), user.getEmail());
    }
}
