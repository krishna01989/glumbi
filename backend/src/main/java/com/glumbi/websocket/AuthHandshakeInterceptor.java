package com.glumbi.websocket;

import com.glumbi.entity.AppUser;
import com.glumbi.repository.UserRepository;
import com.glumbi.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.Optional;

/**
 * Validates the JWT token during the WebSocket upgrade handshake.
 * Token is passed as a query parameter: /ws/events?token=<jwt>
 * On success, puts the authenticated user into the WS session attributes.
 */
@Component
@RequiredArgsConstructor
public class AuthHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String query = request.getURI().getQuery();
        if (query == null) return false;

        String token = null;
        for (String param : query.split("&")) {
            if (param.startsWith("token=")) {
                token = param.substring(6);
                break;
            }
        }
        if (token == null || token.isBlank()) return false;

        try {
            var claims = jwtUtil.parse(token);
            Long userId = ((Number) claims.get("userId")).longValue();
            String email = claims.getSubject();

            Optional<AppUser> user = userRepository.findById(userId);
            if (user.isEmpty() || user.get().isOnHold()) return false;

            attributes.put("userId", userId);
            attributes.put("email", email);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                WebSocketHandler wsHandler, Exception exception) {}
}
