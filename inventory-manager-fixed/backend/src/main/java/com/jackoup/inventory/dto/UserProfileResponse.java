package com.jackoup.inventory.dto;

import com.jackoup.inventory.model.Role;

public record UserProfileResponse(
        String username,
        String fullName,
        Role role
) {
}
