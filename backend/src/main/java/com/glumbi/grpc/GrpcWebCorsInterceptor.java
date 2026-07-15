package com.glumbi.grpc;

import io.grpc.*;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.springframework.beans.factory.annotation.Value;

/**
 * Adds CORS headers to gRPC-Web responses so browsers can call the gRPC server
 * directly (port 9090) without a proxy.
 *
 * gRPC-Web preflight (OPTIONS) is handled at the HTTP level by Netty before
 * reaching gRPC interceptors, so actual gRPC calls just need the response headers.
 */
@GrpcGlobalServerInterceptor
public class GrpcWebCorsInterceptor implements ServerInterceptor {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    private static final Metadata.Key<String> ACCESS_CONTROL_ALLOW_ORIGIN =
            Metadata.Key.of("access-control-allow-origin", Metadata.ASCII_STRING_MARSHALLER);
    private static final Metadata.Key<String> ACCESS_CONTROL_EXPOSE_HEADERS =
            Metadata.Key.of("access-control-expose-headers", Metadata.ASCII_STRING_MARSHALLER);

    @Override
    public <Q, R> ServerCall.Listener<Q> interceptCall(
            ServerCall<Q, R> call, Metadata headers, ServerCallHandler<Q, R> next) {

        // Wrap the call to inject CORS headers into the response trailers
        ServerCall<Q, R> corsCall = new ForwardingServerCall.SimpleForwardingServerCall<>(call) {
            @Override
            public void sendHeaders(Metadata responseHeaders) {
                // Use the first configured origin; in prod this is the Vercel frontend domain
                responseHeaders.put(ACCESS_CONTROL_ALLOW_ORIGIN, allowedOrigins.split(",")[0].trim());
                responseHeaders.put(ACCESS_CONTROL_EXPOSE_HEADERS, "grpc-status,grpc-message");
                super.sendHeaders(responseHeaders);
            }
        };
        return next.startCall(corsCall, headers);
    }
}
