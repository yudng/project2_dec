package com.jackoup.inventory.dto;

import com.jackoup.inventory.model.Role;

public record LoginResponse(
        String token,
        String username,
        String fullName,
        Role role
) {
}
