package com.example.deliverysystem.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.time.Duration;

/**
 * Redis Cache Configuration with TTL and eviction policies
 *
 * Cache Strategy:
 * - TTL-based: Auto-expire after configured duration
 * - Event-based: @CacheEvict on data mutations
 * - LRU Fallback: Redis handles overflow
 *
 * Cache Naming Convention: <domain>:<feature>:<scope>:<detail>
 * Example: pkg:id:123, delivery:trip:999, dashboard:stats
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Default cache configuration (fallback)
     */
    @Bean
    public RedisCacheConfiguration defaultCacheConfig() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .prefixCacheNameWith("cache:");
    }

    /**
     * Configure cache manager with specific TTL for each cache type
     * 
     * Note: Redis Eviction Policy should be set to one of:
     * - allkeys-lru: Evict any key using LRU (best for cache)
     * - volatile-lru: Evict expired keys using LRU
     * - allkeys-lfu: Evict any key using LFU (least frequently used)
     * 
     * Configure in redis.conf: maxmemory-policy allkeys-lru
     * Or via docker-compose: --maxmemory-policy allkeys-lru
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultCacheConfig())
                // ===== Dashboard & Statistics (2 min TTL) =====
                .withCacheConfiguration("dashboard:stats",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(2))
                                .prefixCacheNameWith("cache:"))
                // ===== Package Caches =====
                // All packages: 10 min (for admin list)
                .withCacheConfiguration("pkg:all",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(10))
                                .prefixCacheNameWith("cache:"))
                // Specific package by ID: 15 min (for admin view/edit)
                .withCacheConfiguration("pkg:id",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(15))
                                .prefixCacheNameWith("cache:"))
                // Public package (customer tracking): 30 min (safest for public data)
                .withCacheConfiguration("pkg:public",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(30))
                                .prefixCacheNameWith("cache:"))
                // ===== Delivery Trip Caches =====
                // All trips: 10 min (for admin dashboard)
                .withCacheConfiguration("delivery:trip:all",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(10))
                                .prefixCacheNameWith("cache:"))
                // Active trip for shipper today: 5 min (real-time tracking)
                .withCacheConfiguration("delivery:trip:active",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(5))
                                .prefixCacheNameWith("cache:"))
                // Specific trip by ID: 10 min
                .withCacheConfiguration("delivery:trip:id",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(10))
                                .prefixCacheNameWith("cache:"))
                // Shipper's trips: 5 min (shipper frequently checks assignments)
                .withCacheConfiguration("delivery:trip:shipper",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(5))
                                .prefixCacheNameWith("cache:"))
                // ===== Shipper Caches =====
                // All shippers: 15 min (for admin shipper management)
                .withCacheConfiguration("shipper:all",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(15))
                                .prefixCacheNameWith("cache:"))
                // Specific shipper by ID: 15 min
                .withCacheConfiguration("shipper:id",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(15))
                                .prefixCacheNameWith("cache:"))
                // ===== COD Reconciliation Caches =====
                // Pending COD packages: 5 min (reconciliation is sensitive to changes)
                .withCacheConfiguration("cod:pending",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(5))
                                .prefixCacheNameWith("cache:"))
                .build();
    }
}
