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
        SynthesisInput input = SynthesisInput.newBuilder()
                .setText(text)
                .build();

        VoiceSelectionParams voice = buildVoice(language);

        AudioConfig audioConfig = AudioConfig.newBuilder()
                .setAudioEncoding(AudioEncoding.MP3)
                .setSpeakingRate(0.90)
                .setPitch(1.0)
                .build();

        SynthesizeSpeechResponse response = ttsClient.synthesizeSpeech(input, voice, audioConfig);
        ByteString audioContents = response.getAudioContent();
        return audioContents.toByteArray();
    }

    private VoiceSelectionParams buildVoice(String language) {
        record V(String code, String name) {}
        V v = switch (language.toLowerCase()) {
            // Regional India
            case "tamil"     -> new V("ta-IN", "ta-IN-Wavenet-A");
            case "hindi"     -> new V("hi-IN", "hi-IN-Wavenet-A");
            case "malayalam" -> new V("ml-IN", "ml-IN-Wavenet-A");
            case "telugu"    -> new V("te-IN", "te-IN-Standard-A");
            case "kannada"   -> new V("kn-IN", "kn-IN-Standard-A");
            // International
            case "spanish"   -> new V("es-ES", "es-ES-Wavenet-C");
            case "french"    -> new V("fr-FR", "fr-FR-Wavenet-E");
            case "italian"   -> new V("it-IT", "it-IT-Wavenet-A");
            case "chinese"   -> new V("cmn-CN", "cmn-CN-Wavenet-A");
            case "japanese"  -> new V("ja-JP", "ja-JP-Wavenet-A");
            case "korean"    -> new V("ko-KR", "ko-KR-Wavenet-A");
            default          -> new V("en-US", "en-US-Wavenet-F");
        };
        return VoiceSelectionParams.newBuilder()
                .setLanguageCode(v.code())
                .setName(v.name())
                .setSsmlGender(SsmlVoiceGender.FEMALE)
                .build();
    }
}
