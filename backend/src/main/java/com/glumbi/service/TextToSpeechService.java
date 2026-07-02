package com.glumbi.service;

import com.google.cloud.texttospeech.v1.*;
import com.google.protobuf.ByteString;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TextToSpeechService {

    private final TextToSpeechClient ttsClient;

    public byte[] synthesize(String text, String language) throws Exception {
        return synthesize(text, language, null);
    }

    public byte[] synthesize(String text, String language, String voiceName) throws Exception {
        SynthesisInput input = SynthesisInput.newBuilder()
                .setSsml("<speak>" + text + "</speak>")
                .build();

        VoiceSelectionParams voice = buildVoice(language, voiceName);

        AudioConfig audioConfig = AudioConfig.newBuilder()
                .setAudioEncoding(AudioEncoding.MP3)
                .setSpeakingRate(0.90)
                .setPitch(1.0)
                .build();

        SynthesizeSpeechResponse response = ttsClient.synthesizeSpeech(input, voice, audioConfig);
        return response.getAudioContent().toByteArray();
    }

    private VoiceSelectionParams buildVoice(String language, String voiceName) {
        // If a specific voice name is provided, use it directly
        if (voiceName != null && !voiceName.isBlank() && voiceName.contains("-")) {
            // Derive language code from voice name (e.g. "en-IN-Wavenet-A" -> "en-IN")
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

        // Fall back to language-based defaults
        record V(String code, String name, SsmlVoiceGender gender) {}
        V v = switch (language.toLowerCase()) {
            case "tamil"     -> new V("ta-IN", "ta-IN-Wavenet-A",  SsmlVoiceGender.FEMALE);
            case "hindi"     -> new V("hi-IN", "hi-IN-Wavenet-A",  SsmlVoiceGender.FEMALE);
            case "malayalam" -> new V("ml-IN", "ml-IN-Wavenet-A",  SsmlVoiceGender.FEMALE);
            case "telugu"    -> new V("te-IN", "te-IN-Standard-A", SsmlVoiceGender.FEMALE);
            case "kannada"   -> new V("kn-IN", "kn-IN-Standard-A", SsmlVoiceGender.FEMALE);
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
