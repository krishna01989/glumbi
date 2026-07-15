package com.glumbi.config;

import com.glumbi.websocket.AnalyticsWebSocketHandler;
import com.glumbi.websocket.AuthHandshakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@EnableScheduling
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final AnalyticsWebSocketHandler analyticsWebSocketHandler;
    private final AuthHandshakeInterceptor authHandshakeInterceptor;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(analyticsWebSocketHandler, "/ws/events")
                .addInterceptors(authHandshakeInterceptor)
                .setAllowedOrigins(allowedOrigins.split(","));
    }
}
