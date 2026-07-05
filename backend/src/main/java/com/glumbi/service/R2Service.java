package com.glumbi.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.net.URI;

@Service
public class R2Service {

    private final S3Client s3;
    private final String bucket;
    private final String publicUrl;
    private final boolean configured;

    public R2Service(
            @Value("${R2_ACCESS_KEY_ID:}") String accessKey,
            @Value("${R2_SECRET_ACCESS_KEY:}") String secretKey,
            @Value("${R2_ACCOUNT_ID:}") String accountId,
            @Value("${R2_BUCKET_NAME:glumbi-audio}") String bucket,
            @Value("${R2_PUBLIC_URL:}") String publicUrl) {

        this.bucket    = bucket;
        this.publicUrl = publicUrl.endsWith("/") ? publicUrl.substring(0, publicUrl.length() - 1) : publicUrl;
        this.configured = !accessKey.isBlank() && !secretKey.isBlank() && !accountId.isBlank() && !publicUrl.isBlank();

        if (configured) {
            this.s3 = S3Client.builder()
                    .endpointOverride(URI.create("https://" + accountId + ".r2.cloudflarestorage.com"))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKey, secretKey)))
                    .region(Region.of("auto"))
                    .httpClientBuilder(UrlConnectionHttpClient.builder())
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(true)
                            .checksumValidationEnabled(false)
                            .build())
                    .build();
        } else {
            this.s3 = null;
        }
    }

    public boolean isConfigured() {
        return configured;
    }

    /**
     * Uploads audio bytes to R2 and returns the public URL.
     * Key format: audio/{cacheKey}.mp3  (colons replaced with underscores)
     */
    public String upload(String cacheKey, byte[] audioBytes) {
        String objectKey = "audio/" + cacheKey.replace(":", "_") + ".mp3";
        s3.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(objectKey)
                        .contentType("audio/mpeg")
                        .build(),
                RequestBody.fromBytes(audioBytes));
        return publicUrl + "/" + objectKey;
    }
}
