package com.glumbi.controller;

import com.glumbi.entity.AppUser;
import com.glumbi.repository.UserRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final int MONTHLY_LIMIT = 200;

    private final UserRepository userRepository;

    @GetMapping("/me/quota")
    public ResponseEntity<?> getQuota(@AuthenticationPrincipal AuthUser authUser) {
        AppUser user = userRepository.findById(authUser.id())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String thisMonth = YearMonth.now().toString();
        int used = thisMonth.equals(user.getApiCallMonth()) ? user.getMonthlyApiCalls() : 0;

        return ResponseEntity.ok(Map.of(
            "used",  used,
            "limit", MONTHLY_LIMIT,
            "month", thisMonth
        ));
    }
}
