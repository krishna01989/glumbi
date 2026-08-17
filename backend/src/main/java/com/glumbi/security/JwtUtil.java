package com.glumbi.security;

import com.glumbi.entity.AppUser;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private final Key key;
    private final long expiryMs;

    public JwtUtil(@Value("${app.jwt.secret:glumbi-super-secret-key-change-in-production-min-32-chars}") String secret,
                   @Value("${app.jwt.expiry-hours:24}") int expiryHours) {
        this.key      = Keys.hmacShaKeyFor(secret.getBytes());
        this.expiryMs = (long) expiryHours * 60 * 60 * 1000;
        log.info("JwtUtil: token expiry = {} hours ({} ms)", expiryHours, this.expiryMs);
    }

    public String generate(AppUser user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
    }

    public boolean isValid(String token) {
        try { parse(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }
}
