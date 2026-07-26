package com.glumbi.service;

import com.google.cloud.texttospeech.v1.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TextToSpeechService {

    private final TextToSpeechClient ttsClient;
    private final VendorConfigService vendorConfig;

    public byte[] synthesize(String text, String language) throws Exception {
        return synthesize(text, language, null);
    }

    public byte[] synthesize(String text, String language, String voiceName) throws Exception {
        if (!vendorConfig.isEnabled(VendorConfigService.GOOGLE_TTS))
            throw new IllegalStateException("Google TTS is currently disabled by the administrator.");

        SynthesisInput input = SynthesisInput.newBuilder()
                .setSsml("<speak>" + toSsml(text) + "</speak>")
                .build();

        VoiceSelectionParams voice = buildVoice(language, voiceName);

        AudioConfig audioConfig = AudioConfig.newBuilder()
                .setAudioEncoding(AudioEncoding.MP3)
                .setSpeakingRate(speakingRate(language))
                .setPitch(1.0)
                .build();

        SynthesizeSpeechResponse response = ttsClient.synthesizeSpeech(input, voice, audioConfig);
        return response.getAudioContent().toByteArray();
    }

    // Insert a 400ms pause at paragraph breaks so narration breathes naturally
    private String toSsml(String text) {
        if (text == null) return "";
        // NFC normalization ensures Tamil/Devanagari combining characters are
        // properly composed — without it, TTS reads combining marks as "dot dot curve" etc.
        String normalized = java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFC);
        return normalized
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replaceAll("\n\n+", "<break time=\"400ms\"/>");
    }

    // Indian languages benefit from a slightly slower pace for clarity
    private double speakingRate(String language) {
        return switch (language == null ? "" : language.toLowerCase()) {
            case "tamil", "telugu", "malayalam", "kannada" -> 0.85;
            case "hindi"  -> 0.87;
            default       -> 0.90;
        };
    }

    private VoiceSelectionParams buildVoice(String language, String voiceName) {
        if (voiceName != null && !voiceName.isBlank() && voiceName.contains("-")) {
            String[] parts = voiceName.split("-");
            String langCode = parts.length >= 2 ? parts[0] + "-" + parts[1] : "en-US";
            SsmlVoiceGender gender = voiceName.endsWith("-B") || voiceName.endsWith("-D")
                    ? SsmlVoiceGender.MALE : SsmlVoiceGender.FEMALE;
            return VoiceSelectionParams.newBuilder()
                    .setLanguageCode(langCode)
                    .setName(voiceName)
                    .setSsmlGender(gender)
                    .build();
        }

        record V(String code, String name, SsmlVoiceGender gender) {}
        V v = switch (language == null ? "" : language.toLowerCase()) {
            // Indian — Wavenet where available, Standard fallback (Neural2 not available for any ta/hi/ml/te/kn voices)
            case "tamil"     -> new V("ta-IN", "ta-IN-Wavenet-A",  SsmlVoiceGender.FEMALE);
            case "hindi"     -> new V("hi-IN", "hi-IN-Wavenet-A",  SsmlVoiceGender.FEMALE);
            case "malayalam" -> new V("ml-IN", "ml-IN-Wavenet-A",  SsmlVoiceGender.FEMALE);
            case "telugu"    -> new V("te-IN", "te-IN-Standard-A", SsmlVoiceGender.FEMALE);
            case "kannada"   -> new V("kn-IN", "kn-IN-Standard-A", SsmlVoiceGender.FEMALE);
            // International
            case "spanish"   -> new V("es-ES", "es-ES-Wavenet-C",  SsmlVoiceGender.FEMALE);
            case "french"    -> new V("fr-FR", "fr-FR-Wavenet-E",  SsmlVoiceGender.FEMALE);
            case "italian"   -> new V("it-IT", "it-IT-Wavenet-A",  SsmlVoiceGender.FEMALE);
            case "chinese"   -> new V("cmn-CN", "cmn-CN-Wavenet-A", SsmlVoiceGender.FEMALE);
            case "japanese"  -> new V("ja-JP", "ja-JP-Wavenet-A",  SsmlVoiceGender.FEMALE);
            case "korean"    -> new V("ko-KR", "ko-KR-Wavenet-A",  SsmlVoiceGender.FEMALE);
            default          -> new V("en-US", "en-US-Wavenet-F",  SsmlVoiceGender.FEMALE);
        };
        return VoiceSelectionParams.newBuilder()
                .setLanguageCode(v.code())
                .setName(v.name())
                .setSsmlGender(v.gender())
                .build();
    }
}
