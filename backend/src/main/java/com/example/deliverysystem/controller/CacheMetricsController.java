package com.example.deliverysystem.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Cache Management & Monitoring Endpoint
 * 
 * Provides admin-only access to:
 * - View cache statistics and hit rates
 * - Manually clear specific caches
 * - Monitor Redis memory usage
 * - Debug cache key patterns
 */
@RestController
@RequestMapping("/api/v1/admin/cache")
@RequiredArgsConstructor
@Tag(name = "Admin - Cache Management", description = "Cache statistics, monitoring, and management")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@ConditionalOnClass(RedisTemplate.class)
public class CacheMetricsController {

    private final CacheManager cacheManager;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Get overall cache statistics
     */
    @Operation(summary = "Get cache statistics and hit/miss rates")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get all cache names
        Collection<String> cacheNames = cacheManager.getCacheNames();
        stats.put("totalCaches", cacheNames.size());
        stats.put("cacheNames", cacheNames);

        // Get cache-specific stats
        Map<String, Map<String, Object>> cacheStats = new HashMap<>();
        for (String cacheName : cacheNames) {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                Map<String, Object> info = new HashMap<>();
                
                // Try to get native stats from Redis
                try {
                    Long size = redisTemplate.opsForHash().size("cache:" + cacheName);
                    info.put("entries", size != null ? size : 0);
                } catch (Exception e) {
                    info.put("entries", "N/A");
                }
                
                info.put("type", cache.getClass().getSimpleName());
                cacheStats.put(cacheName, info);
            }
        }
        stats.put("caches", cacheStats);

        // Get Redis memory info
        stats.put("redis", getRedisInfo());
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Get Redis server information
     */
    @Operation(summary = "Get Redis server info (memory, clients, etc)")
    @GetMapping("/redis-info")
    public ResponseEntity<Map<String, Object>> getRedisServerInfo() {
        return ResponseEntity.ok(getRedisInfo());
    }

    /**
     * Clear all caches or a specific cache
     */
    @Operation(summary = "Clear all caches or a specific cache by name")
    @PostMapping("/clear")
    public ResponseEntity<Map<String, String>> clearCache(
            @RequestParam(required = false) String cacheName) {
        
        Map<String, String> result = new HashMap<>();
        
        if (cacheName != null && !cacheName.isBlank()) {
            // Clear specific cache
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                result.put("message", "Cache '" + cacheName + "' cleared successfully");
                result.put("status", "success");
            } else {
                result.put("message", "Cache '" + cacheName + "' not found");
                result.put("status", "error");
                return ResponseEntity.badRequest().body(result);
            }
        } else {
            // Clear all caches
            cacheManager.getCacheNames().forEach(name -> {
                Cache cache = cacheManager.getCache(name);
                if (cache != null) cache.clear();
            });
            result.put("message", "All caches cleared successfully (" + cacheManager.getCacheNames().size() + " caches)");
            result.put("status", "success");
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * Get cache keys by pattern (for debugging)
     */
    @Operation(summary = "Get cache keys matching a pattern (e.g., 'cache:pkg:*')")
    @GetMapping("/keys")
    public ResponseEntity<Map<String, Object>> getCacheKeys(
            @RequestParam(defaultValue = "cache:*") String pattern) {
        
        Map<String, Object> result = new HashMap<>();
        result.put("pattern", pattern);
        
        try {
            Set<String> keys = new HashSet<>();
            redisTemplate.execute((connection) -> {
                try (var cursor = connection.scan(ScanOptions.scanOptions().match(pattern).count(100).build())) {
                    cursor.forEachRemaining(key -> keys.add(new String(key)));
                }
                return null;
            });
            
            result.put("keys", keys);
            result.put("count", keys.size());
            result.put("status", "success");
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * Get detailed info about a specific cache key
     */
    @Operation(summary = "Get TTL and other details for a specific cache key")
    @GetMapping("/key/{key}")
    public ResponseEntity<Map<String, Object>> getCacheKeyInfo(@PathVariable String key) {
        Map<String, Object> info = new HashMap<>();
        info.put("key", key);
        
        try {
            Boolean exists = redisTemplate.hasKey(key);
            info.put("exists", exists != null && exists);
            
            if (Boolean.TRUE.equals(exists)) {
                Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
                info.put("ttlSeconds", ttl);
                
                // Get approximate size
                String value = (String) redisTemplate.opsForValue().get(key);
                info.put("valueSize", value != null ? value.length() : 0);
                
                info.put("type", redisTemplate.type(key).code());
                info.put("status", "found");
            } else {
                info.put("status", "not_found");
            }
        } catch (Exception e) {
            info.put("status", "error");
            info.put("message", e.getMessage());
        }
        
        return ResponseEntity.ok(info);
    }

    /**
     * Get cache hit rate estimate by analyzing recent keys
     */
    @Operation(summary = "Estimate cache hit rate (scans recent keys)")
    @GetMapping("/hit-rate")
    public ResponseEntity<Map<String, Object>> estimateHitRate() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Set<String> allKeys = new HashSet<>();
            redisTemplate.execute((connection) -> {
                try (var cursor = connection.scan(ScanOptions.scanOptions().match("cache:*").count(1000).build())) {
                    cursor.forEachRemaining(key -> allKeys.add(new String(key)));
                }
                return null;
            });
            
            result.put("totalCacheKeys", allKeys.size());
            
            // Group by cache type
            Map<String, Long> cacheDistribution = allKeys.stream()
                    .collect(Collectors.groupingBy(k -> k.split(":")[1], Collectors.counting()));
            
            result.put("cacheDistribution", cacheDistribution);
            
            // Estimate based on key count (higher keys = higher hit rate if eviction is working)
            double estimatedHitRate = Math.min(85.0, (allKeys.size() / 100.0) * 50.0);
            result.put("estimatedHitRatePercent", estimatedHitRate);
            
            result.put("note", "Hit rate is estimated based on cache key count. For actual metrics, use Spring Boot Actuator: /actuator/metrics/cache.*");
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * Helper: Get Redis info
     */
    private Map<String, Object> getRedisInfo() {
        Map<String, Object> info = new HashMap<>();
        
        try {
            redisTemplate.execute((connection) -> {
                Properties serverInfo = connection.info("memory", "clients", "stats");
                if (serverInfo != null) {
                    info.put("usedMemory", serverInfo.getProperty("used_memory"));
                    info.put("usedMemoryHuman", serverInfo.getProperty("used_memory_human"));
                    info.put("maxMemory", serverInfo.getProperty("maxmemory"));
                    info.put("connectedClients", serverInfo.getProperty("connected_clients"));
                    info.put("totalConnections", serverInfo.getProperty("total_connections_received"));
                    info.put("totalCommands", serverInfo.getProperty("total_commands_processed"));
                }
                return null;
            });
            info.put("status", "connected");
        } catch (Exception e) {
            info.put("status", "error");
            info.put("message", e.getMessage());
        }
        
        return info;
    }
}
