package com.pvmanagement.service;

import com.pvmanagement.dto.UpdateProfileRequest;
import com.pvmanagement.dto.UserProfileDto;
import com.pvmanagement.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserAccountRepository userAccountRepository;

    public UserService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public UserProfileDto updateProfile(String email, UpdateProfileRequest request) {
        var user = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setDisplayName(request.displayName());
        var saved = userAccountRepository.save(user);
        var roles = saved.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());
        return new UserProfileDto(saved.getId(), saved.getEmail(), saved.getDisplayName(), saved.isEnabled(),
                saved.isEmailVerified(), saved.getCreatedAt(), roles);
    }
}
