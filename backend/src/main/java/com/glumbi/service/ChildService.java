package com.glumbi.service;

import com.glumbi.dto.ChildRequest;
import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.repository.ChildRepository;
import com.glumbi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildRepository repo;
    private final UserRepository userRepo;

    public List<Child> getByOwner(Long ownerId) {
        return repo.findByOwnerId(ownerId);
    }

    public Child getById(Long id, Long ownerId) {
        return repo.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new RuntimeException("Child not found: " + id));
    }

    public Child getByIdUnchecked(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Child not found: " + id));
    }

    public Child create(ChildRequest req, Long ownerId) {
        AppUser owner = userRepo.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Child child = new Child();
        child.setOwner(owner);
        child.setName(req.getName());
        child.setBirthDate(req.getBirthDate());
        child.setAvatarEmoji(req.getAvatarEmoji());
        child.setGender(req.getGender());
        child.setTheme(req.getTheme() != null ? req.getTheme() : "coral");
        child.setEnabledFeatures(req.getEnabledFeatures() != null
                ? req.getEnabledFeatures()
                : defaultFeatures(req.getBirthDate()));
        return repo.save(child);
    }

    public Child update(Long id, ChildRequest req, Long ownerId) {
        Child child = getById(id, ownerId);
        child.setName(req.getName());
        child.setBirthDate(req.getBirthDate());
        child.setAvatarEmoji(req.getAvatarEmoji());
        child.setGender(req.getGender());
        child.setTheme(req.getTheme() != null ? req.getTheme() : "coral");
        if (req.getEnabledFeatures() != null) {
            child.setEnabledFeatures(req.getEnabledFeatures());
        }
        return repo.save(child);
    }

    private String defaultFeatures(LocalDate birthDate) {
        int age = Period.between(birthDate, LocalDate.now()).getYears();
        if (age >= 7) {
            return "[\"stories\",\"activities\",\"curiosity\",\"draw\",\"journal\",\"timeline\",\"readquiz\",\"mywriting\"]";
        }
        return "[\"stories\",\"activities\",\"curiosity\",\"draw\",\"journal\",\"timeline\"]";
    }

    public void delete(Long id, Long ownerId) {
        Child child = getById(id, ownerId);
        repo.delete(child);
    }
}
