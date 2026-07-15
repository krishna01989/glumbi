package com.glumbi.grpc;

import com.glumbi.repository.UserRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.security.JwtUtil;
import io.grpc.*;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;

@GrpcGlobalServerInterceptor
@RequiredArgsConstructor
public class GrpcAuthInterceptor implements ServerInterceptor {

    // Context key that downstream gRPC services read to get the authenticated user
    public static final Context.Key<AuthUser> AUTH_USER_KEY = Context.key("authUser");

    private static final Metadata.Key<String> AUTH_HEADER =
            Metadata.Key.of("authorization", Metadata.ASCII_STRING_MARSHALLER);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;

    @Override
    public <Q, R> ServerCall.Listener<Q> interceptCall(
            ServerCall<Q, R> call, Metadata headers, ServerCallHandler<Q, R> next) {

        String header = headers.get(AUTH_HEADER);
        if (header == null || !header.startsWith("Bearer ")) {
            call.close(Status.UNAUTHENTICATED.withDescription("Missing or invalid Authorization header"), new Metadata());
            return new ServerCall.Listener<>() {};
        }

        String token = header.substring(7);
        if (!jwtUtil.isValid(token)) {
            call.close(Status.UNAUTHENTICATED.withDescription("Invalid or expired token"), new Metadata());
            return new ServerCall.Listener<>() {};
        }

        Claims claims = jwtUtil.parse(token);
        Long userId = claims.get("userId", Long.class);

        // Block held accounts
        var userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty() || userOpt.get().isOnHold()) {
            call.close(Status.PERMISSION_DENIED.withDescription("Account suspended"), new Metadata());
            return new ServerCall.Listener<>() {};
        }

        AuthUser authUser = new AuthUser(userId, claims.getSubject(), claims.get("role", String.class));
        Context ctx = Context.current().withValue(AUTH_USER_KEY, authUser);
        return Contexts.interceptCall(ctx, call, headers, next);
    }
}
