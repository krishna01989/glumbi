package com.glumbi.config;

import com.glumbi.agent.RelevanceGuard.RelevanceException;
import com.glumbi.agent.SafetyGuard.SafetyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final HttpHeaders JSON_HEADERS = new HttpHeaders();
    static { JSON_HEADERS.setContentType(MediaType.APPLICATION_JSON); }

    @ExceptionHandler(RelevanceException.class)
    public ResponseEntity<Map<String, String>> handleRelevance(RelevanceException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(JSON_HEADERS)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(SafetyException.class)
    public ResponseEntity<Map<String, String>> handleSafety(SafetyException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(JSON_HEADERS)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getDefaultMessage())
                .findFirst()
                .orElse("Invalid input");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(JSON_HEADERS)
                .body(Map.of("error", message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArg(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(JSON_HEADERS)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).headers(JSON_HEADERS)
                .body(Map.of("error", "Something went wrong. Please try again!"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAll(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).headers(JSON_HEADERS)
                .body(Map.of("error", "Something went wrong. Please try again!"));
    }
}
