package com.glumbi.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.glumbi.entity.AppSetting;
import com.glumbi.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Admin-level vendor kill switches stored in app_settings as "vendor.<name>.enabled".
 * Cached for 30 seconds so toggling takes effect quickly without hammering the DB.
 */
@Service
@RequiredArgsConstructor
public class VendorConfigService implements ApplicationRunner {

    private static final String PREFIX = "vendor.";
    private static final String SUFFIX = ".enabled";

    public static final String ANTHROPIC  = "anthropic";
    public static final String GOOGLE_TTS = "google_tts";
    public static final String ELEVENLABS = "elevenlabs";
    public static final String RESEND     = "resend";
    public static final String VOYAGE     = "voyage";
    public static final String R2         = "r2";

    private static final List<String[]> DEFAULTS = List.of(
        new String[]{ANTHROPIC,  "true",  "Claude AI — stories, curiosity, quiz, safety guard, all AI generation"},
        new String[]{GOOGLE_TTS, "true",  "Google Text-to-Speech — story audio, read-along, handwriting"},
        new String[]{ELEVENLABS, "true",  "ElevenLabs — family voice cloning and synthesis"},
        new String[]{RESEND,     "true",  "Resend — all transactional email (password reset, weekly recap, announcements)"},
        new String[]{VOYAGE,     "true",  "Voyage AI — semantic embeddings and RAG similarity search"},
        new String[]{R2,         "true",  "Cloudflare R2 — audio file storage and serving"}
    );

    private final AppSettingRepository settingRepo;

    private final Cache<String, Boolean> cache = Caffeine.newBuilder()
            .expireAfterWrite(30, TimeUnit.SECONDS)
            .build();

    public boolean isEnabled(String vendor) {
        return cache.get(vendor, k -> {
            String key = PREFIX + k + SUFFIX;
            return settingRepo.findById(key)
                    .map(s -> Boolean.parseBoolean(s.getValue()))
                    .orElse(true); // default enabled if missing
        });
    }

    public void setEnabled(String vendor, boolean enabled) {
        String key = PREFIX + vendor + SUFFIX;
        AppSetting s = settingRepo.findById(key).orElse(new AppSetting());
        s.setKey(key);
        s.setValue(String.valueOf(enabled));
        settingRepo.save(s);
        cache.invalidate(vendor);
    }

    /** Returns all vendors with their current enabled state and description. */
    public List<Map<String, Object>> getAll() {
        return DEFAULTS.stream().map(row -> {
            String vendor = row[0];
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("vendor", vendor);
            m.put("enabled", isEnabled(vendor));
            m.put("description", row[2]);
            return m;
        }).toList();
    }

    @Override
    public void run(ApplicationArguments args) {
        for (String[] row : DEFAULTS) {
            String key = PREFIX + row[0] + SUFFIX;
            if (!settingRepo.existsById(key)) {
                AppSetting s = new AppSetting();
                s.setKey(key);
                s.setValue(row[1]);
                settingRepo.save(s);
            }
        }
    }
}
