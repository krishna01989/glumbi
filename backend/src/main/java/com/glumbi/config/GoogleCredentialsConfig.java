package com.glumbi.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * On Railway (and other PaaS), we can't mount files — so the Google service account
 * JSON is stored as the env var GOOGLE_CREDENTIALS_JSON. On startup, we write it to
 * a temp file and point GOOGLE_APPLICATION_CREDENTIALS at it.
 * Locally, GOOGLE_APPLICATION_CREDENTIALS can point directly to the JSON file as usual.
 */
@Configuration
public class GoogleCredentialsConfig {

    @Value("${GOOGLE_CREDENTIALS_JSON:}")
    private String credentialsJson;

    @PostConstruct
    public void init() throws Exception {
        if (credentialsJson == null || credentialsJson.isBlank()) return;
        Path tmp = Files.createTempFile("gcp-credentials", ".json");
        Files.writeString(tmp, credentialsJson);
        tmp.toFile().deleteOnExit();
        System.setProperty("GOOGLE_APPLICATION_CREDENTIALS", tmp.toString());
    }
}
