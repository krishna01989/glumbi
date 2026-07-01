package com.glumbi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String tokenParam = req.getParameter("token");
        String header = req.getHeader("Authorization");
        String rawToken = (header != null && header.startsWith("Bearer ")) ? header.substring(7) : tokenParam;
        if (rawToken != null && jwtUtil.isValid(rawToken)) {
            Claims claims = jwtUtil.parse(rawToken);
            Long userId = claims.get("userId", Long.class);

            // Block held accounts even if token is valid
            var userOpt = userRepo.findById(userId);
            if (userOpt.isPresent() && userOpt.get().isOnHold()) {
                String reason = userOpt.get().getHoldReason() != null
                    ? userOpt.get().getHoldReason()
                    : "Your account has been suspended. Please contact support@glumbi.com.";
                res.setStatus(403);
                res.setContentType("application/json");
                res.getWriter().write(objectMapper.writeValueAsString(
                    Map.of("error", "account_on_hold", "reason", reason)
                ));
                return;
            }

            String email = claims.getSubject();
            String role  = claims.get("role", String.class);
            var auth = new UsernamePasswordAuthenticationToken(
                    new AuthUser(userId, email, role),
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(req, res);
    }

    public record AuthUser(Long id, String email, String role) {}
}
