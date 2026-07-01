package com.glumbi.service;

import com.google.cloud.texttospeech.v1.*;
import com.google.protobuf.ByteString;
import org.springframework.stereotype.Service;

/**
 * TextToSpeechService — converts text to audio using Google Cloud WaveNet voices.
 *
 * WaveNet voices sound dramatically more natural than browser speechSynthesis,
 * especially for Indian and Asian languages where browser support is inconsistent.
 *
 * International: English, Spanish, French, Italian, Chinese, Japanese, Korean
 * Regional India: Tamil, Hindi, Malayalam, Telugu, Kannada
 */
@Service
public class TextToSpeechService {

    public byte[] synthesize(String text, String language) throws Exception {
        try (TextToSpeechClient client = TextToSpeechClient.create()) {

            SynthesisInput input = SynthesisInput.newBuilder()
                    .setText(text)
                    .build();

            VoiceSelectionParams voice = buildVoice(language);

            AudioConfig audioConfig = AudioConfig.newBuilder()
                    .setAudioEncoding(AudioEncoding.MP3)
                    .setSpeakingRate(0.90)   // slightly slower — easier for toddlers to follow
                    .setPitch(1.0)
                    .build();

            SynthesizeSpeechResponse response = client.synthesizeSpeech(input, voice, audioConfig);
            ByteString audioContents = response.getAudioContent();
            return audioContents.toByteArray();
        }
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
