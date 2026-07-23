package com.glumbi.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class ElevenLabsService {

    private static final String BASE_URL = "https://api.elevenlabs.io/v1";
    private static final String BOUNDARY  = "----GlumbiBoundary";

    @Value("${elevenlabs.api-key:}")
    private String apiKey;

    @org.springframework.beans.factory.annotation.Autowired
    private VendorConfigService vendorConfig;

    private final HttpClient http = HttpClient.newHttpClient();

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Uploads an audio sample to ElevenLabs and returns the cloned voice_id.
     * @param audioBytes  raw audio bytes (MP3, WAV, M4A, etc.)
     * @param fileName    original filename including extension
     * @param voiceName   display name for the voice in ElevenLabs dashboard
     */
    public String cloneVoice(byte[] audioBytes, String fileName, String voiceName) throws IOException, InterruptedException {
        if (!vendorConfig.isEnabled(VendorConfigService.ELEVENLABS))
            throw new IllegalStateException("ElevenLabs is currently disabled by the administrator.");
        String boundary = BOUNDARY + UUID.randomUUID().toString().replace("-", "");

        byte[] body = buildMultipartBody(boundary, audioBytes, fileName, voiceName);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/voices/add"))
                .header("xi-api-key", apiKey)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                .build();

        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("ElevenLabs voice clone failed: " + response.statusCode() + " " + response.body());
        }

        // Extract voice_id from JSON: {"voice_id":"..."}
        String json = response.body();
        int idx = json.indexOf("\"voice_id\"");
        if (idx < 0) throw new RuntimeException("ElevenLabs response missing voice_id: " + json);
        int start = json.indexOf('"', idx + 10) + 1;
        int end   = json.indexOf('"', start);
        return json.substring(start, end);
    }

    /**
     * Synthesizes speech using a cloned voice.
     */
    public byte[] synthesize(String text, String voiceId) throws IOException, InterruptedException {
        if (!vendorConfig.isEnabled(VendorConfigService.ELEVENLABS))
            throw new IllegalStateException("ElevenLabs is currently disabled by the administrator.");
        String jsonBody = String.format(
            "{\"text\":\"%s\",\"model_id\":\"eleven_multilingual_v2\",\"voice_settings\":{\"stability\":0.5,\"similarity_boost\":0.8}}",
            escapeJson(text)
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/text-to-speech/" + voiceId + "?output_format=mp3_44100_128"))
                .header("xi-api-key", apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<byte[]> response = http.send(request, HttpResponse.BodyHandlers.ofByteArray());

        if (response.statusCode() != 200) {
            throw new RuntimeException("ElevenLabs TTS failed: " + response.statusCode());
        }
        return response.body();
    }

    /**
     * Deletes a cloned voice from ElevenLabs.
     */
    public void deleteVoice(String voiceId) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/voices/" + voiceId))
                .header("xi-api-key", apiKey)
                .DELETE()
                .build();
        http.send(request, HttpResponse.BodyHandlers.discarding());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private byte[] buildMultipartBody(String boundary, byte[] audioBytes, String fileName, String voiceName) {
        String nl = "\r\n";
        StringBuilder sb = new StringBuilder();

        // name field
        sb.append("--").append(boundary).append(nl);
        sb.append("Content-Disposition: form-data; name=\"name\"").append(nl).append(nl);
        sb.append(voiceName).append(nl);

        // files field
        sb.append("--").append(boundary).append(nl);
        sb.append("Content-Disposition: form-data; name=\"files\"; filename=\"").append(fileName).append("\"").append(nl);
        sb.append("Content-Type: audio/mpeg").append(nl).append(nl);

        byte[] prefix = sb.toString().getBytes(StandardCharsets.UTF_8);
        byte[] suffix = (nl + "--" + boundary + "--" + nl).getBytes(StandardCharsets.UTF_8);

        byte[] combined = new byte[prefix.length + audioBytes.length + suffix.length];
        System.arraycopy(prefix, 0, combined, 0, prefix.length);
        System.arraycopy(audioBytes, 0, combined, prefix.length, audioBytes.length);
        System.arraycopy(suffix, 0, combined, prefix.length + audioBytes.length, suffix.length);
        return combined;
    }

    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r");
    }
}
