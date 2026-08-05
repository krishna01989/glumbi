package com.glumbi.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.agent.TorchHuntAgent;
import com.glumbi.agent.TorchHuntAgent.TorchObject;
import com.glumbi.entity.Child;
import com.glumbi.entity.TorchHuntPack;
import com.glumbi.repository.TorchHuntPackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TorchHuntService {

    private final TorchHuntPackRepository packRepository;
    private final TorchHuntAgent agent;
    private final ObjectMapper mapper;

    public static String ageGroup(int age) {
        if (age <= 4)  return "3-4";
        if (age <= 6)  return "5-6";
        if (age <= 8)  return "7-8";
        return "9-10";
    }

    public static int childAge(Child child) {
        if (child.getBirthYear() == null) return 6;
        return LocalDate.now().getYear() - child.getBirthYear();
    }

    /** True if this parent already has a pack for this theme + age group (free to load). */
    public boolean packExists(Long userId, String themeKey, String ageGroup) {
        return packRepository.findByUserIdAndThemeKeyAndAgeGroup(userId, themeKey, ageGroup).isPresent();
    }

    /** Returns an existing pack or generates a new one (credits pre-checked by controller). */
    @Transactional
    public TorchHuntPack getOrGenerate(Long userId, String themeKey, String ageGroup) {
        Optional<TorchHuntPack> existing = packRepository.findByUserIdAndThemeKeyAndAgeGroup(userId, themeKey, ageGroup);
        if (existing.isPresent()) return existing.get();

        TorchHuntAgent.PackResult result = agent.generate(themeKey, ageGroup);
        if (result == null) return null;

        TorchHuntPack pack = new TorchHuntPack();
        pack.setUserId(userId);
        pack.setThemeKey(themeKey);
        pack.setAgeGroup(ageGroup);
        pack.setObjectsJson(toJson(result.objects()));
        pack.setNarrativesJson(toJson(result.narratives()));
        try {
            return packRepository.save(pack);
        } catch (DataIntegrityViolationException e) {
            // Race condition — another request already saved the pack; return that one
            return packRepository.findByUserIdAndThemeKeyAndAgeGroup(userId, themeKey, ageGroup)
                    .orElseThrow(() -> e);
        }
    }

    /** Force-refresh: parent explicitly requests a new pack (credits pre-checked by controller). */
    @Transactional
    public TorchHuntPack refresh(Long userId, String themeKey, String ageGroup) {
        packRepository.findByUserIdAndThemeKeyAndAgeGroup(userId, themeKey, ageGroup)
                .ifPresent(p -> { packRepository.delete(p); packRepository.flush(); });
        TorchHuntAgent.PackResult result = agent.generate(themeKey, ageGroup);
        if (result == null) return null;

        TorchHuntPack pack = new TorchHuntPack();
        pack.setUserId(userId);
        pack.setThemeKey(themeKey);
        pack.setAgeGroup(ageGroup);
        pack.setObjectsJson(toJson(result.objects()));
        pack.setNarrativesJson(toJson(result.narratives()));
        return packRepository.save(pack);
    }

    public Map<String, Object> packToResponse(TorchHuntPack pack) {
        try {
            List<TorchObject> objects = mapper.readValue(pack.getObjectsJson(), new TypeReference<>() {});
            List<String> narratives = mapper.readValue(pack.getNarrativesJson(), new TypeReference<>() {});
            return Map.of(
                    "packId",     pack.getId(),
                    "themeKey",   pack.getThemeKey(),
                    "ageGroup",   pack.getAgeGroup(),
                    "objects",    objects,
                    "narratives", narratives
            );
        } catch (Exception e) {
            return Map.of("error", "pack_parse_failed");
        }
    }

    private String toJson(Object obj) {
        try { return mapper.writeValueAsString(obj); }
        catch (Exception e) { return "[]"; }
    }
}
