package com.glumbi.config;

import com.google.api.gax.grpc.InstantiatingGrpcChannelProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.texttospeech.v1.TextToSpeechClient;
import com.google.cloud.texttospeech.v1.TextToSpeechSettings;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.threeten.bp.Duration;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class GoogleCredentialsConfig {

    @Value("${GOOGLE_CREDENTIALS_JSON:}")
    private String credentialsJson;

    @Bean
    public TextToSpeechClient textToSpeechClient() throws Exception {
        // Keep gRPC channel alive during Railway idle periods — without keepalive the channel
        // goes stale after ~30–60 min of inactivity and the next TTS call returns 500.
        InstantiatingGrpcChannelProvider channelProvider =
            TextToSpeechSettings.defaultGrpcTransportProviderBuilder()
                .setKeepAliveTime(Duration.ofSeconds(60))
                .setKeepAliveTimeout(Duration.ofSeconds(10))
                .setKeepAliveWithoutCalls(true)
                .build();

        TextToSpeechSettings.Builder settingsBuilder = TextToSpeechSettings.newBuilder()
            .setTransportChannelProvider(channelProvider);

        if (credentialsJson != null && !credentialsJson.isBlank()) {
            GoogleCredentials credentials = ServiceAccountCredentials.fromStream(
                new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8))
            );
            settingsBuilder.setCredentialsProvider(() -> credentials);
        }

        return TextToSpeechClient.create(settingsBuilder.build());
    }
}
