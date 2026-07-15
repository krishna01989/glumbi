package com.glumbi.websocket;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.service.ChildActivityEventService;
import com.glumbi.service.ChildActivityEventService.EventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.PingMessage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.nio.ByteBuffer;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handles the persistent WebSocket connection for analytics event streaming.
 *
 * Protocol (text frames, JSON):
 *   Client → Server: JSON array of ActivityEvent objects
 *   Server → Client: {"saved": N}
 *
 * Lifecycle management:
 *   - Heartbeat ping every 30s detects dead connections (network dropout, phone slept)
 *   - Idle timeout closes sessions silent for 10 minutes (child walked away)
 *   - Tab-hidden close is handled on the frontend via visibilitychange
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AnalyticsWebSocketHandler extends TextWebSocketHandler {

    private static final long IDLE_TIMEOUT_MS = 10 * 60 * 1000L;  // 10 minutes
    private static final long HEARTBEAT_MS    = 30 * 1000L;        // 30 seconds

    private final ChildActivityEventService activityEventService;
    private final ObjectMapper objectMapper;

    // sessionId → (session, lastActivityTime)
    private record SessionEntry(WebSocketSession session, Instant lastActive) {}
    private final ConcurrentHashMap<String, SessionEntry> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.put(session.getId(), new SessionEntry(session, Instant.now()));
        log.debug("Analytics WS connected: session={} user={}", session.getId(),
                session.getAttributes().get("userId"));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Refresh activity timestamp on every incoming message
        sessions.put(session.getId(), new SessionEntry(session, Instant.now()));

        Long userId  = (Long)   session.getAttributes().get("userId");
        String email = (String) session.getAttributes().get("email");

        List<EventDto> events = objectMapper.readValue(
                message.getPayload(), new TypeReference<List<EventDto>>() {});

        int saved = activityEventService.saveBatch(events, userId, email);

        session.sendMessage(new TextMessage("{\"saved\":" + saved + "}"));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
        log.debug("Analytics WS closed: session={} status={}", session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        sessions.remove(session.getId());
        String msg = exception.getMessage();
        // "Connection reset" is a normal browser disconnect (tab close, refresh, OS kill) — not an error
        if (msg != null && msg.contains("Connection reset")) {
            log.debug("Analytics WS disconnected abruptly: session={}", session.getId());
        } else {
            log.warn("Analytics WS transport error: session={} error={}", session.getId(), msg);
        }
        closeQuietly(session, CloseStatus.SERVER_ERROR);
    }

    /**
     * Every 30s: close idle sessions, then ping the rest.
     *
     * Idle (no message for 10 min): close with 1001 Going Away — the child walked away.
     * Ping failure: dead connection (network dropout, phone slept) — remove it.
     * Browsers respond to pings automatically with a pong (RFC 6455), no client code needed.
     */
    @Scheduled(fixedDelay = HEARTBEAT_MS)
    public void heartbeat() {
        Instant idleCutoff = Instant.now().minusMillis(IDLE_TIMEOUT_MS);
        PingMessage ping   = new PingMessage(ByteBuffer.wrap(new byte[0]));

        for (Map.Entry<String, SessionEntry> entry : sessions.entrySet()) {
            SessionEntry se = entry.getValue();

            if (se.lastActive().isBefore(idleCutoff)) {
                log.debug("Analytics WS idle timeout: session={}", entry.getKey());
                sessions.remove(entry.getKey());
                closeQuietly(se.session(), CloseStatus.GOING_AWAY);
                continue;
            }

            try {
                se.session().sendMessage(ping);
            } catch (Exception e) {
                // Send failed — connection is dead, clean it up
                log.debug("Analytics WS ping failed, removing dead session={}", entry.getKey());
                sessions.remove(entry.getKey());
            }
        }
    }

    private void closeQuietly(WebSocketSession session, CloseStatus status) {
        try { if (session.isOpen()) session.close(status); } catch (Exception ignored) {}
    }
}
