package com.glumbi.controller;

import com.glumbi.entity.Child;
import com.glumbi.entity.DrawSave;
import com.glumbi.entity.FlipbookSave;
import com.glumbi.repository.DrawSaveRepository;
import com.glumbi.repository.FlipbookSaveRepository;
import com.glumbi.service.ChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/draw-saves")
@RequiredArgsConstructor
public class DrawSaveController {

    private final DrawSaveRepository drawRepo;
    private final FlipbookSaveRepository flipbookRepo;
    private final ChildService childService;

    // ── Draw saves ─────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<?> saveDrawing(@RequestBody Map<String, Object> body) {
        Long childId = Long.parseLong(body.get("childId").toString());
        String imageData = (String) body.get("imageData");
        String title = body.containsKey("title") ? (String) body.get("title") : null;

        if (imageData == null || imageData.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "No image provided"));

        Child child = childService.getByIdUnchecked(childId);
        DrawSave save = new DrawSave();
        save.setChild(child);
        save.setImageData(imageData);
        save.setTitle(title);
        return ResponseEntity.ok(drawRepo.save(save));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDrawing(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        return drawRepo.findById(id).map(save -> {
            save.setImageData((String) body.get("imageData"));
            if (body.containsKey("title")) save.setTitle((String) body.get("title"));
            save.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
            return ResponseEntity.ok(drawRepo.save(save));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/child/{childId}")
    public List<DrawSave> getDrawings(@PathVariable Long childId) {
        return drawRepo.findByChildIdOrderByUpdatedAtDesc(childId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDrawing(@PathVariable Long id) {
        drawRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Flipbook saves ─────────────────────────────────────────────────────────

    @PostMapping("/flipbook")
    public ResponseEntity<?> saveFlipbook(@RequestBody Map<String, Object> body) {
        Long childId = Long.parseLong(body.get("childId").toString());
        String framesJson = (String) body.get("framesJson");
        String thumbnail = (String) body.get("thumbnail");
        String title = body.containsKey("title") ? (String) body.get("title") : null;
        int fps = body.containsKey("fps") ? Integer.parseInt(body.get("fps").toString()) : 8;
        int frameCount = body.containsKey("frameCount") ? Integer.parseInt(body.get("frameCount").toString()) : 0;

        if (framesJson == null || framesJson.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "No frames provided"));

        Child child = childService.getByIdUnchecked(childId);
        FlipbookSave save = new FlipbookSave();
        save.setChild(child);
        save.setFramesJson(framesJson);
        save.setThumbnail(thumbnail);
        save.setTitle(title);
        save.setFps(fps);
        save.setFrameCount(frameCount);
        return ResponseEntity.ok(flipbookRepo.save(save));
    }

    @PutMapping("/flipbook/{id}")
    public ResponseEntity<?> updateFlipbook(@PathVariable Long id,
                                            @RequestBody Map<String, Object> body) {
        return flipbookRepo.findById(id).map(save -> {
            save.setFramesJson((String) body.get("framesJson"));
            if (body.containsKey("thumbnail")) save.setThumbnail((String) body.get("thumbnail"));
            if (body.containsKey("title")) save.setTitle((String) body.get("title"));
            if (body.containsKey("fps")) save.setFps(Integer.parseInt(body.get("fps").toString()));
            if (body.containsKey("frameCount")) save.setFrameCount(Integer.parseInt(body.get("frameCount").toString()));
            save.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
            return ResponseEntity.ok(flipbookRepo.save(save));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/flipbook/child/{childId}")
    public List<FlipbookSave> getFlipbooks(@PathVariable Long childId) {
        return flipbookRepo.findByChildIdOrderByUpdatedAtDesc(childId);
    }

    @DeleteMapping("/flipbook/{id}")
    public ResponseEntity<Void> deleteFlipbook(@PathVariable Long id) {
        flipbookRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
