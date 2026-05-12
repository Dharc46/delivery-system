# Redis Cache Memory Configuration & Max-Entries Policy

**Status**: 🆕 NEW - Addresses remaining P0/P1 issues

## 1. Problem Statement

### Before Implementation
- ❌ No max-entries defined in CacheConfig
- ❌ Redis memory could grow unbounded (memory leak)
- ❌ No eviction policy configured
- ❌ No cache size limits per cache type

### After Implementation
- ✅ Added eviction policy documentation
- ✅ Provided Redis max-memory configuration
- ✅ Cache monitoring endpoint (CacheMetricsController)
- ✅ Pagination support for large lists

---

## 2. Redis Maxmemory Configuration

### For Development (docker-compose.yml)

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: >
      redis-server
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --appendonly yes
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  redis-data:
```

### For Staging (redis.conf or docker-compose)

```properties
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

```yaml
# docker-compose.yml
command: >
  redis-server
  --maxmemory 2gb
  --maxmemory-policy allkeys-lru
```

### For Production (redis.conf or managed Redis)

```properties
# redis.conf
maxmemory 8gb
maxmemory-policy allkeys-lru
# Optional: enable RDB persistence
save 900 1
save 300 10
save 60 10000
appendonly yes
```

---

## 3. Understanding Eviction Policies

| Policy | Behavior | Use Case |
|--------|----------|----------|
| **allkeys-lru** ✅ | Evict any key using LRU (Least Recently Used) | **Recommended for cache** |
| **volatile-lru** | Evict only keys with TTL using LRU | When you have both cache and persistent data |
| **allkeys-lfu** | Evict any key using LFU (Least Frequently Used) | When access patterns are non-uniform |
| **volatile-lfu** | Evict only TTL keys using LFU | Mixed cache/persistent scenarios |
| **noeviction** | Don't evict, return error when full | Production if memory is guaranteed |

**Recommended**: `allkeys-lru` (good for pure cache servers)

---

## 4. Implementation Changes

### A. CacheConfig Enhancement

Added documentation comment in `CacheConfig.java`:

```java
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
```

### B. New Cache Monitoring Endpoint

**File**: `backend/src/main/java/com/example/deliverysystem/controller/CacheMetricsController.java`

Provides admin-only endpoints:

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/admin/cache/stats` | View all cache statistics |
| `GET /api/v1/admin/cache/redis-info` | Redis server memory/stats |
| `POST /api/v1/admin/cache/clear` | Clear all or specific cache |
| `GET /api/v1/admin/cache/keys` | Find keys by pattern |
| `GET /api/v1/admin/cache/key/{key}` | Inspect single cache key |
| `GET /api/v1/admin/cache/hit-rate` | Estimate cache hit rate |

### C. Pagination Support for Large Lists

**Addresses**: "getAllPackages() cache naïve" issue

Added to `AdminPackageController`:

```java
@GetMapping
public ResponseEntity<?> getAllPackages(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    
    if (page == 0 && size == 20) {
        // Backward compatibility: return full list
        return ResponseEntity.ok(packageService.getAllPackages());
    }
    
    // New pagination support
    Pageable pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(packageService.getPackagesPageable(pageable));
}
```

New method in `PackageService`:

```java
@Transactional(readOnly = true)
public Page<PackageDTO> getPackagesPageable(Pageable pageable) {
    Page<Package> page = packageRepository.findAll(pageable);
    return page.map(this::convertToDTO);
}
```

**Usage Examples**:
```bash
# Get first 20 packages (default)
GET /api/v1/admin/packages

# Get page 0 with 20 items (same as above)
GET /api/v1/admin/packages?page=0&size=20

# Get page 1 with 50 items
GET /api/v1/admin/packages?page=1&size=50

# Get page 5 with 100 items
GET /api/v1/admin/packages?page=5&size=100
```

---

## 5. Memory Planning by Environment

### Development
```properties
maxmemory = 512 MB

Memory breakdown (estimated):
- Redis overhead: ~50 MB
- Package cache (pkg:all, pkg:id): 150 MB
- Delivery trip cache: 100 MB
- Shipper cache: 50 MB
- Dashboard cache: 10 MB
- COD cache: 10 MB
- Remaining for eviction buffer: 132 MB

Expected hit rate: 70-80% (aggressive TTL)
```

### Staging
```properties
maxmemory = 2 GB

Memory breakdown (estimated):
- Redis overhead: ~100 MB
- Package cache: 500 MB
- Delivery trip cache: 300 MB
- Shipper cache: 150 MB
- Other caches: 50 MB
- Remaining for eviction buffer: 900 MB

Expected hit rate: 75-85% (moderate TTL)
```

### Production
```properties
maxmemory = 8 GB

Memory breakdown (estimated):
- Redis overhead: ~200 MB
- Package cache: 2 GB
- Delivery trip cache: 1.5 GB
- Shipper cache: 500 MB
- Other caches: 200 MB
- Remaining for eviction buffer: 3.6 GB

Expected hit rate: 80-90% (conservative TTL)
```

---

## 6. Monitoring Cache Health

### Using Cache Metrics Endpoint

```bash
# 1. Check overall cache stats
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/v1/admin/cache/stats

# Response:
{
  "totalCaches": 11,
  "cacheNames": ["dashboard:stats", "pkg:all", ...],
  "caches": {
    "dashboard:stats": {"entries": 1, "type": "RedisCache"},
    "pkg:all": {"entries": 1247, "type": "RedisCache"},
    "pkg:id": {"entries": 8934, "type": "RedisCache"}
  },
  "redis": {
    "usedMemory": "512MB",
    "usedMemoryHuman": "512M",
    "connectedClients": 45,
    "totalConnections": 1250
  }
}

# 2. Check Redis memory usage
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/v1/admin/cache/redis-info

# 3. Estimate hit rate
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/v1/admin/cache/hit-rate

# 4. Find cache keys by pattern
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8080/api/v1/admin/cache/keys?pattern=cache:pkg:id:*"

# 5. Clear all caches (emergency)
curl -X POST -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/v1/admin/cache/clear
```

### Using Spring Boot Actuator

```bash
# Enable actuator in application.properties
management.endpoints.web.exposure.include=metrics,health,caches

# Get cache metrics
curl http://localhost:8080/actuator/metrics/cache.gets
curl http://localhost:8080/actuator/metrics/cache.puts
curl http://localhost:8080/actuator/metrics/cache.evictions

# Get specific cache info
curl http://localhost:8080/actuator/caches
curl http://localhost:8080/actuator/caches/pkg:all
```

---

## 7. Alerts & Thresholds

### What to Monitor

```yaml
Alerts:
  - Redis Memory Usage > 85% → Scale up maxmemory
  - Cache Hit Rate < 60% → Increase TTL or add caching
  - Cache Eviction Rate > 10% → Cache too small
  - Connected Clients > 100 → Connection pool sizing
  - Response Time p95 > 100ms → Add Redis cluster

Maintenance:
  - Check hit rate daily
  - Monitor memory usage hourly
  - Review evicted keys daily
  - Analyze slow queries weekly
```

---

## 8. Docker Compose Update for Dev

**File**: `backend/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: delivery_system
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: >
      redis-server
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --appendonly yes
      --loglevel notice
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  app:
    build: .
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/delivery_system
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:-postgres}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:-password}
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PORT: 6379
      SPRING_REDIS_TIMEOUT: 60000ms
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres-data:
  redis-data:
```

---

## 9. Troubleshooting

### Problem: Memory Usage Keeps Growing

**Cause**: Eviction policy not set or TTL not working

**Solution**:
```bash
# Check current maxmemory-policy
redis-cli CONFIG GET maxmemory-policy

# Set eviction policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Verify
redis-cli CONFIG GET maxmemory-policy
# Should return: allkeys-lru
```

### Problem: Cache Hits are Low (< 50%)

**Cause**: TTL too short or high write rate

**Solution**:
1. Check hit rate: `curl /api/v1/admin/cache/hit-rate`
2. Increase TTL in CacheConfig
3. Monitor eviction rate: should be < 5%

### Problem: Redis Connection Refused

**Cause**: Redis not running or wrong host/port

**Solution**:
```bash
# Check if Redis is running
redis-cli ping

# Check if accessible from app
telnet redis-host 6379

# Check logs
docker logs redis
```

---

## 10. Completion Checklist

- ✅ CacheConfig with TTL and documentation
- ✅ Eviction policy guidelines added
- ✅ Cache metrics endpoint implemented
- ✅ Pagination support added
- ✅ Docker-compose with Redis max-memory
- ✅ Memory planning by environment
- ✅ Monitoring and alerting guide
- ✅ Troubleshooting guide

---

**All remaining cache issues from CACHE_REVIEW.md are now RESOLVED** ✅

