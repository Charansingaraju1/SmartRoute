package com.anuraguniversity.smartroute.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum UserRole {
    STUDENT,
    TEACHER;

    @JsonCreator
    public static UserRole fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return UserRole.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}