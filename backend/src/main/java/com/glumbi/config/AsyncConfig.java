package com.glumbi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Configuration
public class AsyncConfig {

    @Value("${app.embedding.thread-pool-size:4}")
    private int embeddingThreadPoolSize;

    @Bean(name = "embeddingExecutor", destroyMethod = "shutdown")
    public ExecutorService embeddingExecutor() {
        return Executors.newFixedThreadPool(embeddingThreadPoolSize);
    }
}
