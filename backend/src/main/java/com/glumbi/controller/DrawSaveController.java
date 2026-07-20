package com.glumbi.controller;

import com.glumbi.entity.Child;
import com.glumbi.entity.DrawSave;
import com.glumbi.entity.FlipbookSave;
import com.glumbi.repository.DrawSaveRepository;
import com.glumbi.repository.FlipbookSaveRepository;
import com.glumbi.service.ChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/draw-saves")
@RequiredArgsConstructor
public class DrawSaveController {

    private static final int PAGE_SIZE = 12;
    private static final int THUMB_W   = 240;
    private static final int THUMB_H   = 160;

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
        save.setThumbnail(generateThumbnail(imageData));
        save.setTitle(title);
        return ResponseEntity.ok(drawRepo.save(save));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDrawing(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        return drawRepo.findById(id).map(save -> {
            String imageData = (String) body.get("imageData");
            save.setImageData(imageData);
            save.setThumbnail(generateThumbnail(imageData));
            if (body.containsKey("title")) save.setTitle((String) body.get("title"));
            save.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
            return ResponseEntity.ok(drawRepo.save(save));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Paginated list — thumbnail only, not full imageData. */
    @GetMapping("/child/{childId}")
    public Page<Map<String, Object>> getDrawings(@PathVariable Long childId,
                                                  @RequestParam(defaultValue = "0") int page) {
        return drawRepo.findByChildIdOrderByUpdatedAtDesc(childId, PageRequest.of(page, PAGE_SIZE))
                .map(s -> Map.of(
                        "id",        (Object) s.getId(),
                        "title",     (Object) (s.getTitle() != null ? s.getTitle() : ""),
                        "thumbnail", (Object) (s.getThumbnail() != null ? s.getThumbnail() : ""),
                        "updatedAt", (Object) s.getUpdatedAt().toString()
                ));
    }

    /** Returns full imageData for loading onto canvas. */
    @GetMapping("/{id}/full")
    public ResponseEntity<?> getDrawingFull(@PathVariable Long id) {
        return drawRepo.findById(id)
                .map(s -> ResponseEntity.ok(Map.of(
                        "id",        s.getId(),
                        "title",     s.getTitle() != null ? s.getTitle() : "",
                        "imageData", s.getImageData()
                )))
                .orElse(ResponseEntity.notFound().build());
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

    /** Paginated list — thumbnail only, not framesJson. */
    @GetMapping("/flipbook/child/{childId}")
    public Page<Map<String, Object>> getFlipbooks(@PathVariable Long childId,
                                                   @RequestParam(defaultValue = "0") int page) {
        return flipbookRepo.findByChildIdOrderByUpdatedAtDesc(childId, PageRequest.of(page, PAGE_SIZE))
                .map(s -> Map.of(
                        "id",         (Object) s.getId(),
                        "title",      (Object) (s.getTitle() != null ? s.getTitle() : ""),
                        "thumbnail",  (Object) (s.getThumbnail() != null ? s.getThumbnail() : ""),
                        "fps",        (Object) s.getFps(),
                        "frameCount", (Object) s.getFrameCount(),
                        "updatedAt",  (Object) s.getUpdatedAt().toString()
                ));
    }

    /** Returns full framesJson for loading into the editor. */
    @GetMapping("/flipbook/{id}/full")
    public ResponseEntity<?> getFlipbookFull(@PathVariable Long id) {
        return flipbookRepo.findById(id)
                .map(s -> ResponseEntity.ok(Map.of(
                        "id",         s.getId(),
                        "title",      s.getTitle() != null ? s.getTitle() : "",
                        "framesJson", s.getFramesJson(),
                        "fps",        s.getFps(),
                        "frameCount", s.getFrameCount()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/flipbook/{id}")
    public ResponseEntity<Void> deleteFlipbook(@PathVariable Long id) {
        flipbookRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Thumbnail generation ───────────────────────────────────────────────────

    private String generateThumbnail(String base64ImageData) {
        if (base64ImageData == null || base64ImageData.isBlank()) return null;
        try {
            byte[] bytes = Base64.getDecoder().decode(base64ImageData);
            BufferedImage src = ImageIO.read(new ByteArrayInputStream(bytes));
            if (src == null) return null;

            BufferedImage thumb = new BufferedImage(THUMB_W, THUMB_H, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = thumb.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, THUMB_W, THUMB_H);
            g.drawImage(src, 0, 0, THUMB_W, THUMB_H, null);
            g.dispose();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(thumb, "png", out);
            return Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (Exception e) {
            return null;
        }
    }
}
