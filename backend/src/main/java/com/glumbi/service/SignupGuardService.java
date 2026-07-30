package com.glumbi.service;

import com.glumbi.entity.AppSetting;
import com.glumbi.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class SignupGuardService {

    static final String KEY = "signup.enabled";
    private static final long CACHE_TTL_MS = 30_000; // 30 seconds

    private final AppSettingRepository appSettingRepo;

    private final AtomicBoolean cachedValue = new AtomicBoolean(true);
    private final AtomicLong    cacheExpiry = new AtomicLong(0);

    public boolean isSignupEnabled() {
        long now = System.currentTimeMillis();
        if (now < cacheExpiry.get()) {
            return cachedValue.get();
        }
        boolean enabled = appSettingRepo.findById(KEY)
                .map(s -> !"false".equalsIgnoreCase(s.getValue()))
                .orElse(true); // default open
        cachedValue.set(enabled);
        cacheExpiry.set(now + CACHE_TTL_MS);
        return enabled;
    }

    public void setSignupEnabled(boolean enabled) {
        AppSetting setting = appSettingRepo.findById(KEY).orElseGet(() -> {
            AppSetting s = new AppSetting();
            s.setKey(KEY);
            return s;
        });
        setting.setValue(String.valueOf(enabled));
        appSettingRepo.save(setting);
        // Invalidate cache immediately
        cachedValue.set(enabled);
        cacheExpiry.set(System.currentTimeMillis() + CACHE_TTL_MS);
    }
}
