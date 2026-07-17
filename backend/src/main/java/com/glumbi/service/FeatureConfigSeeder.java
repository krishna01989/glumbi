package com.glumbi.service;

import com.glumbi.entity.FeatureConfig;
import com.glumbi.repository.FeatureConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class FeatureConfigSeeder implements ApplicationRunner {

    private final FeatureConfigRepository featureConfigRepo;

    private static final List<Object[]> DEFAULTS = List.of(
        new Object[]{"story",         2, "Generate a bedtime story"},
        new Object[]{"activity",      2, "Generate a personalised activity"},
        new Object[]{"curiosity",     1, "Answer a child curiosity question"},
        new Object[]{"read-quiz",     3, "Generate a read & quiz session"},
        new Object[]{"writing-coach", 1, "Writing coach feedback"},
        new Object[]{"translation",   5, "Translate a passage"},
        new Object[]{"draw",          1, "React to a child's drawing with AI praise"},
        new Object[]{"learn-validate",1, "Validate a letter drawing"},
        new Object[]{"learn-word",    2, "Identify a written word"},
        new Object[]{"story-listen",    1, "First listen of a story (TTS synthesis)"},
        new Object[]{"memory",            0, "Memory Play feature gate (enables all memory sub-features)"},
        new Object[]{"memory-flashcards", 1, "Generate a flashcard set"},
        new Object[]{"word-of-day",       1, "Generate word of the day"},
        new Object[]{"memory-match",      1, "Generate a memory match game"},
        new Object[]{"journal-ai",        2, "AI-generated journal entry from child's daily activity"},
        new Object[]{"draw-guide",          1, "AI step-by-step drawing guide for a chosen subject"},
        new Object[]{"draw-animate",        1, "Bring a child's drawing to life with animation (1 credit per use)"},
        new Object[]{"maze",               1, "Generate a maze game level"},
        new Object[]{"riddle",             1, "Generate a set of 5 riddles"}
    );

    @Override
    public void run(ApplicationArguments args) {
        for (Object[] row : DEFAULTS) {
            String name = (String) row[0];
            if (!featureConfigRepo.existsById(name)) {
                FeatureConfig fc = new FeatureConfig();
                fc.setFeatureName(name);
                fc.setCreditCost((int) row[1]);
                fc.setDescription((String) row[2]);
                featureConfigRepo.save(fc);
            }
        }
    }
}
