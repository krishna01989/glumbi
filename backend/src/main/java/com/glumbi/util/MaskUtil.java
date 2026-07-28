package com.glumbi.util;

public final class MaskUtil {

    private MaskUtil() {}

    /**
     * Masks an email address for display.
     * Always shows first 2 chars of local part, last 1 char if the local part is
     * long enough that it doesn't overlap with the prefix, and fixed "***" in between.
     *
     * Examples:
     *   krishnaswamyv89@gmail.com  →  kr***9@gmail.com
     *   john@example.com           →  jo***n@example.com
     *   ab@ymail.com               →  ab***@ymail.com
     *   a@ymail.com                →  a***@ymail.com
     */
    public static String maskEmail(String email) {
        if (email == null) return "—";
        int at = email.indexOf('@');
        if (at <= 0) return "***";
        String local  = email.substring(0, at);
        String domain = email.substring(at); // includes the @

        int showStart = Math.min(2, local.length());
        String prefix = local.substring(0, showStart);
        // Only show suffix char if it doesn't overlap with the prefix
        String suffix = local.length() > showStart + 1 ? String.valueOf(local.charAt(local.length() - 1)) : "";
        return prefix + "***" + suffix + domain;
    }
}
