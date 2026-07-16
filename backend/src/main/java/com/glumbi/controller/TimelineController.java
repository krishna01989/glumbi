package com.glumbi.controller;

import com.glumbi.repository.ChildRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.TimelineService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    private final TimelineService timelineService;
    private final ChildRepository childRepository;

    public TimelineController(TimelineService timelineService, ChildRepository childRepository) {
        this.timelineService = timelineService;
        this.childRepository = childRepository;
    }

    @GetMapping("/{childId}")
    public ResponseEntity<Page<Map<String, Object>>> getTimeline(
            @PathVariable Long childId,
            @PageableDefault(size = 15) Pageable pageable,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String type,
            @AuthenticationPrincipal AuthUser user) {

        boolean owned = childRepository.findByIdAndOwnerId(childId, user.id()).isPresent();
        if (!owned && !"ADMIN".equals(user.role())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(timelineService.getPage(childId, pageable, from, to, type));
    }
}
