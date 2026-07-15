package com.glumbi.controller;

import com.glumbi.grpc.ProtoDecoder;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ChildActivityEventService;
import com.glumbi.service.ChildActivityEventService.EventDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Spring MVC bridge for gRPC-Web clients (browsers).
 *
 * Browsers can't speak native gRPC (requires HTTP/2 binary framing that fetch API doesn't support).
 * This controller accepts gRPC-Web requests on port 8080 alongside REST — same process, same auth,
 * no extra infrastructure. It decodes the binary protobuf body, delegates to the same service that
 * the native gRPC server (port 9090) uses, and returns a gRPC-Web framed protobuf response.
 *
 * URL matches the gRPC path convention: /glumbi.ActivityEventService/BatchEvents
 */
@RestController
@RequestMapping("/glumbi.ActivityEventService")
@RequiredArgsConstructor
public class GrpcWebBridgeController {

    private final ChildActivityEventService activityEventService;

    @PostMapping(
        value = "/BatchEvents",
        consumes = "application/grpc-web+proto",
        produces = "application/grpc-web+proto"
    )
    public ResponseEntity<byte[]> batchEvents(
            @RequestBody byte[] body,
            @AuthenticationPrincipal AuthUser caller) {

        if (caller == null) {
            return grpcWebError(401, "Unauthenticated");
        }

        List<EventDto> events;
        try {
            byte[] proto = ProtoDecoder.extractGrpcWebDataFrame(body);
            events = ProtoDecoder.decodeBatchEventsRequest(proto);
        } catch (Exception e) {
            return grpcWebError(400, "Malformed request: " + e.getMessage());
        }

        int saved = activityEventService.saveBatch(events, caller.id(), caller.email());

        byte[] responseFrame = ProtoDecoder.encodeGrpcWebResponse(saved);

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("application/grpc-web+proto"))
            .header("grpc-status", "0")
            .body(responseFrame);
    }

    private ResponseEntity<byte[]> grpcWebError(int httpStatus, String message) {
        return ResponseEntity.status(httpStatus)
            .contentType(MediaType.parseMediaType("application/grpc-web+proto"))
            .header("grpc-status", "2")
            .header("grpc-message", message)
            .body(new byte[0]);
    }
}
