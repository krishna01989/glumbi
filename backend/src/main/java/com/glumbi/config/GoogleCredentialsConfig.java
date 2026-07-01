package com.glumbi.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.texttospeech.v1.TextToSpeechClient;
import com.google.cloud.texttospeech.v1.TextToSpeechSettings;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class GoogleCredentialsConfig {

    @Value("${GOOGLE_CREDENTIALS_JSON:}")
    private String credentialsJson;

    @Bean
    public TextToSpeechClient textToSpeechClient() throws Exception {
        if (credentialsJson != null && !credentialsJson.isBlank()) {
            GoogleCredentials credentials = ServiceAccountCredentials.fromStream(
                new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8))
            );
            TextToSpeechSettings settings = TextToSpeechSettings.newBuilder()
                .setCredentialsProvider(() -> credentials)
                .build();
            return TextToSpeechClient.create(settings);
        }
        // Local dev — uses GOOGLE_APPLICATION_CREDENTIALS env var / gcloud auth
        return TextToSpeechClient.create();
    }
}
