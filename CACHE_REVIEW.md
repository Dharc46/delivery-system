# Cache Key, TTL, và Cache Eviction Policy - Phân tích và Khuyến nghị

**Ngày: 2026-05-12**
**Trạng thái: Hiện tại sử dụng Spring Cache + Redis (cơ bản, chưa tối ưu)**

## 1. Tình trạng hiện tại

### 1.1 Caching Infrastructure
- ✅ `@EnableCaching` đã kích hoạt ở `DeliveryManagementSystemApplication.java`
- ✅ `spring-boot-starter-data-redis` trong pom.xml
- ✅ Redis được tự động cấu hình qua Spring Boot autoconfiguration
- ❌ Chưa có file cấu hình cache rõ ràng (CacheConfiguration class)
- ❌ Chưa định nghĩa TTL cho các cache

### 1.2 Cache Keys hiện tại
```
Định nghĩa hiện tại:
- PackageService:
  - getAllPackages():        "packages" (key mặc định)
  - getPackageById(id):      "packages::id" (key = "#id")
  - getPublicPackageById():  "packages::public-<id>" (key = "'public-' + #id")
  
- CodReconciliationService:
  - getPackagesForCodReconciliation(): "codReconciliation::pending"
  
- DashboardService:
  - getDashboardStats():     "dashboardStats" (key mặc định)
```

### 1.3 Cache Eviction hiện tại
```
Sử dụng @CacheEvict với allEntries = true:
- PackageService.createPackage():   Xóa "packages" + "dashboardStats"
- PackageService.updatePackage():   Xóa "packages" + "dashboardStats"
- PackageService.deletePackage():   Xóa "packages" + "dashboardStats"
- CodReconciliationService.confirmCodReconciliation(): Xóa "codReconciliation" + "dashboardStats"

⚠️ VẤNĐỀ: allEntries = true xóa TẤT CẢ entries, không hiệu quả khi có nhiều cache entries
```

### 1.4 TTL hiện tại
- ❌ Không có TTL được định nghĩa rõ → Redis mặc định **không có expiry** → **MEMORY LEAK**
- ⚠️ Cache chỉ bị xóa khi @CacheEvict được gọi hoặc hết dung lượng Redis (LRU eviction)

## 2. Các vấn đề cần giải quyết

### P0 - Critical Issues
| Vấn đề | Tác động | Mức độ |
|-------|---------|-------|
| Không có TTL → Memory leak | Cache luôn tồn tại, chiếm bộ nhớ không kiểm soát | 🔴 Critical |
| Dùng allEntries = true | Xóa toàn bộ cache không cần thiết, giảm hit rate | 🟠 High |
| Không phân biệt cache permission | Cache công khai + private trộn lẫn | 🟠 High |
| Không có max-entries | Cache có thể tăng không giới hạn | 🟠 High |

### P1 - Issues cần cải thiện
| Vấn đề | Tác động | Mức độ |
|-------|---------|-------|
| Không có cache metrics | Không biết hit rate, miss rate, memory usage | 🟡 Medium |
| getAllPackages() cache naïve | Không phân trang, cache toàn bộ danh sách (lớn) | 🟡 Medium |
| Bộ nhớ Redis không lập kế hoạch | Không biết bao nhiêu RAM cho cache | 🟡 Medium |

## 3. Khuyến nghị: Cache Strategy mới

### 3.1 Cache Naming Convention
```
<domain>:<feature>:<scope>:<detail>

Ví dụ:
- pkg:all                           // Tất cả packages
- pkg:id:123                        // Package với ID 123
- pkg:public:456                    // Package công khai (public)
- pkg:shipper:789:trip:999          // Package của shipper 789 trong trip 999
- delivery:trip:999                 // Delivery trip 999
- dashboard:stats                   // Dashboard statistics
- cod:pending                       // COD packages chờ đối soát
- shipper:list                      // Danh sách shippers
```

### 3.2 Cache Definitions với TTL

```
Cache Name          | TTL        | Max Entries | Scope | Eviction Policy
-------------------|------------|-------------|-------|------------------
pkg:all             | 10 minutes | N/A         | Admin | LRU (rethink)
pkg:id:*            | 15 minutes | 10,000      | Admin | LRU
pkg:public:*        | 30 minutes | 50,000      | Public| LRU
pkg:shipper:*       | 5 minutes  | 5,000       | Private | LRU
delivery:trip:*     | 10 minutes | 5,000       | Private | LRU
dashboard:stats     | 2 minutes  | 1           | Admin | LRU
cod:pending         | 5 minutes  | 1           | Admin | LRU
shipper:list        | 15 minutes | 1           | Admin | LRU
```

**Ghi chú TTL:**
- **2 min**: Dữ liệu thay đổi rất nhanh (dashboard, COD reconciliation)
- **5 min**: Dữ liệu shipper (live tracking có thể thay đổi)
- **10 min**: Dữ liệu package admin (ít thay đổi)
- **15 min**: Package ID specific (ít thay đổi)
- **30 min**: Dữ liệu công khai (rất ít thay đổi)

### 3.3 Cache Eviction Policies

**Recommendation: Hybrid Strategy**

1. **TTL-based** (Time expiry): Tự động xóa sau thời gian nhất định
2. **Event-based** (@CacheEvict): Xóa khi dữ liệu thay đổi (create/update/delete)
3. **LRU Fallback**: Nếu Redis full, loại bỏ entries ít dùng nhất

**Chi tiết:**
```
PackageService.createPackage()
  → @CacheEvict(value = {"pkg:all", "dashboard:stats"})  // Xóa specific, ko allEntries
  
PackageService.updatePackage(id)
  → @CacheEvict(value = {"pkg:id:*", "pkg:all", "dashboard:stats"})  // Xóa chỉ cần thiết
  → Hoặc: @CacheEvict(value = "pkg:id", key = "#id")  // Xóa chỉ 1 ID
  
PackageService.deletePackage(id)
  → @CacheEvict(value = {"pkg:id:*", "pkg:all", "dashboard:stats"})

CodReconciliationService.confirmCodReconciliation()
  → @CacheEvict(value = {"cod:pending", "dashboard:stats"})  // Không cần xóa pkg:*
```

## 4. Implementation Plan

### Bước 1: Tạo CacheConfiguration class
**File:** `backend/src/main/java/com/example/deliverysystem/config/CacheConfig.java`

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        return builder -> builder
            // Dashboard cache: 2 minutes TTL, 1 entry max
            .withCacheConfiguration("dashboard:stats",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(2))
                    .prefixKeysWith("cache:"))
            
            // Package general: 10 minutes TTL, no limit but implicit Redis eviction
            .withCacheConfiguration("pkg:all",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(10)))
            
            // Package by ID: 15 minutes TTL
            .withCacheConfiguration("pkg:id",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(15)))
            
            // Public packages: 30 minutes TTL
            .withCacheConfiguration("pkg:public",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(30)))
            
            // COD reconciliation: 5 minutes TTL
            .withCacheConfiguration("cod:pending",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(5)))
            
            // Shipper list: 15 minutes TTL
            .withCacheConfiguration("shipper:list",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(15)));
    }
}
```

### Bước 2: Cập nhật Redis configuration trong application.properties

```properties
# Redis Cache Configuration
spring.redis.host=${REDIS_HOST:localhost}
spring.redis.port=${REDIS_PORT:6379}
spring.redis.password=${REDIS_PASSWORD:}
spring.redis.timeout=60000ms
spring.redis.jedis.pool.max-active=8
spring.redis.jedis.pool.max-idle=8
spring.redis.jedis.pool.min-idle=0
spring.redis.jedis.pool.max-wait=-1ms

# Cache Configuration
spring.cache.type=redis
spring.cache.redis.key-prefix=cache:
spring.cache.redis.use-key-prefix=true
spring.cache.redis.time-to-live=600000  # 10 minutes default fallback
```

### Bước 3: Refactor PackageService cache usage

```java
// Thay vì:
@Cacheable(value = "packages")
public List<PackageDTO> getAllPackages()

// Thành:
@Cacheable(value = "pkg:all")
public List<PackageDTO> getAllPackages()

// Thay vì:
@Cacheable(value = "packages", key = "#id")
public PackageDTO getPackageById(Long id)

// Thành:
@Cacheable(value = "pkg:id", key = "#id")
public PackageDTO getPackageById(Long id)

// Thay vì:
@Cacheable(value = "packages", key = "'public-' + #id")
public PackageDTO getPublicPackageById(Long id)

// Thành:
@Cacheable(value = "pkg:public", key = "#id")
public PackageDTO getPublicPackageById(Long id)

// Thay vì:
@CacheEvict(value = {"packages", "dashboardStats"}, allEntries = true)

// Thành:
@CacheEvict(value = {"pkg:all", "dashboard:stats"}, allEntries = false)
// hoặc cho update:
@CacheEvict(value = {"pkg:id", "pkg:all", "dashboard:stats"}, allEntries = false)
```

### Bước 4: Thêm Cache Monitoring Endpoint (tuỳ chọn)

```java
@RestController
@RequestMapping("/api/v1/admin/cache")
@RequiredArgsConstructor
public class CacheMetricsController {
    
    private final CacheManager cacheManager;
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        
        for (String cacheName : cacheManager.getCacheNames()) {
            Cache cache = cacheManager.getCache(cacheName);
            // Collect cache statistics if available
            stats.put(cacheName, "Monitored");
        }
        
        return stats;
    }
    
    @PostMapping("/clear")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> clearCache(@RequestParam(required = false) String cacheName) {
        if (cacheName != null) {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) cache.clear();
        } else {
            cacheManager.getCacheNames().forEach(name -> 
                cacheManager.getCache(name).clear()
            );
        }
        return Map.of("message", "Cache cleared successfully");
    }
}
```

## 5. Environment-specific Configuration

### development (application-dev.properties)
```properties
# More aggressive caching for dev testing
spring.cache.redis.time-to-live=1800000  # 30 minutes
spring.redis.jedis.pool.max-active=4
```

### staging (application-staging.properties)
```properties
# Moderate caching
spring.cache.redis.time-to-live=600000   # 10 minutes
spring.redis.jedis.pool.max-active=8
```

### production (application-prod.properties)
```properties
# Conservative caching with strong monitoring
spring.cache.redis.time-to-live=600000   # 10 minutes default
spring.redis.jedis.pool.max-active=16
spring.redis.timeout=30000ms
# Enable Redis sentinel/cluster if needed
```

## 6. Testing Cache Behavior

### 6.1 Unit Test Example
```java
@Test
void testPackageCache() {
    // First call - cache miss
    PackageDTO dto1 = packageService.getPackageById(1L);
    
    // Second call - cache hit
    PackageDTO dto2 = packageService.getPackageById(1L);
    
    // Verify same instance (cached)
    assertEquals(dto1, dto2);
    
    // Update package - should evict
    packageService.updatePackage(1L, updatedDTO);
    
    // After eviction, new instance
    PackageDTO dto3 = packageService.getPackageById(1L);
    assertEquals(dto3, updatedDTO);
}
```

### 6.2 Integration Test
```java
@Test
void testCacheTTLExpiration() throws InterruptedException {
    // Giả sử TTL = 5 giây cho test
    PackageDTO dto1 = packageService.getPackageById(1L);
    
    // Wait for TTL expiration
    Thread.sleep(6000);
    
    // Should be cache miss after TTL
    PackageDTO dto2 = packageService.getPackageById(1L);
    assertEquals(dto1, dto2);  // Data same, but fetched from DB
}
```

## 7. Monitoring & Alerting

### Metrics để theo dõi:
- **Cache Hit Rate**: > 70% là tốt
- **Cache Eviction Rate**: Theo dõi để điều chỉnh TTL/size
- **Redis Memory Usage**: Không vượt 80% max memory
- **Cache Entry Count**: Theo dõi size của từng cache

### Commands để debug:
```bash
# Connect to Redis
redis-cli

# Check cache keys
keys "cache:*"

# Check memory usage
INFO memory

# Clear all caches (prod: cẩn thận!)
FLUSHDB

# Check TTL of a key
TTL key-name
```

## 8. Rollout Plan

**Phase 1** (Day 1): Tạo CacheConfig class, update properties
**Phase 2** (Day 1): Refactor service cache annotations
**Phase 3** (Day 2): Deploy to staging, monitor hit rates
**Phase 4** (Day 3): Add cache metrics endpoint
**Phase 5** (Day 3): Deploy to production with monitoring

## 9. Success Criteria

✅ TTL được định nghĩa cho tất cả caches
✅ Cache hit rate > 60% trên dashboard/list endpoints
✅ Redis memory usage được kiểm soát (< 500MB on dev/staging)
✅ Không có memory leak complaints
✅ Cache eviction hoạt động đúng khi update data
✅ Tests pass cho cache behavior

---
**Người soạn**: AI Assistant
**Status**: Ready for Implementation
