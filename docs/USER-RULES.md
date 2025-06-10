# 📋 User Rules - Nguyên tắc Development

## 🎯 Core Development Rules

### 🌐 **Rule 1: Language Requirement**
```
✅ Always respond in Tiếng Việt
```
- Tất cả communication, documentation, comments đều bằng tiếng Việt
- Đảm bảo team Việt Nam hiểu rõ và thuận tiện làm việc
- Technical terms có thể giữ tiếng Anh nhưng giải thích bằng tiếng Việt

### 📦 **Rule 2: Version Compliance & Type Safety**
```
✅ Luôn kiểm tra phiên bản của thư viện để code chuẩn phiên bản
✅ Kiểm tra lại có đúng kiểu dữ liệu
```

**🔍 Version Checking Process:**
- Luôn dùng **phiên bản cao nhất** và **stable** của libraries
- Kiểm tra compatibility matrix giữa các dependencies
- Update pom.xml/package.json với version cụ thể (không dùng ranges)
- Test thoroughly sau khi upgrade version

**🛡️ Type Safety Requirements:**
- **Backend**: Strict type checking với Jakarta EE annotations
- **Frontend**: TypeScript strict mode enabled
- **API**: OpenAPI schema validation
- **Database**: Proper column types và constraints

**📋 Implementation Checklist:**
```bash
# Kiểm tra versions trước khi code
mvn dependency:tree | grep -i version
npm audit --audit-level=high

# Type checking
mvn compile -Dmaven.compiler.failOnError=true
npm run type-check
```

### 🎯 **Rule 3: Practical Implementation**
```
✅ Luôn làm code để đáp ứng thực tiễn
✅ Tránh các code giải quyết vấn đề nhưng không thực tiễn
```

**❌ Avoid - Academic Solutions:**
- Code quá phức tạp cho requirement đơn giản
- Over-engineering patterns không cần thiết
- Abstract classes/interfaces không có use case thực tế
- Performance optimization cho cases không xảy ra

**✅ Prefer - Practical Solutions:**
- Simple, readable, maintainable code
- Real-world error handling
- User-friendly interfaces
- Performance adequate cho actual load
- Business logic phù hợp với quy trình thực tế

**🏗️ Practical Implementation Examples:**

```java
// ❌ Over-engineered
public abstract class AbstractGenericRepositoryFactoryBean<T extends BaseEntity> 
    implements GenericCrudOperations<T, ID> {
    // 200 lines of complex abstraction...
}

// ✅ Practical approach
@Repository
public class MovieRepository extends JpaRepository<Movie, Long> {
    @Query("SELECT m FROM Movie m WHERE m.status = 'ACTIVE'")
    List<Movie> findActiveMovies();
}
```

```typescript
// ❌ Academic approach
interface AbstractComponentFactoryStrategy<T extends ComponentProps> {
    createComponent<K extends keyof T>(props: T[K]): ReactElement;
}

// ✅ Practical approach  
export function MovieCard({ movie }: { movie: Movie }) {
    return <Card>{movie.title}</Card>;
}
```

### 🛡️ **Rule 4: Safe File Management**
```
✅ Khi xóa 1 file hãy kiểm tra hậu quả và nếu có ảnh hưởng 
✅ Hãy có 1 phương án thay thế để đảm bảo sự thay đổi không ảnh hưởng tới tổng thể dự án
```

**🔧 Implementation:**
- Sử dụng `scripts/safe-delete.ps1` trước khi xóa file
- Luôn analyze dependencies và impact
- Có backup và rollback plan
- Test thoroughly sau khi restructure

## 🎯 Enforcement

### ✅ **Code Review Checklist:**
- [ ] **Tiếng Việt**: Comments, documentation, variable names rõ ràng
- [ ] **Version Check**: Tất cả dependencies dùng version mới nhất stable
- [ ] **Type Safety**: Không có any types, proper validation
- [ ] **Practical**: Code solve real business problems, not academic exercises
- [ ] **Safe Changes**: File changes có impact analysis

### 🔍 **Quality Gates:**
```bash
# Version compliance
mvn versions:display-dependency-updates
npm audit

# Type safety
mvn compile -X
npm run type-check --strict

# Practical check
# Code review focusing on business value
# Performance testing with realistic data
```

### 📊 **Metrics:**
- **Line Coverage**: Focus on business logic, not academic patterns
- **Cyclomatic Complexity**: Keep low for maintainability  
- **Type Coverage**: 100% TypeScript coverage
- **Version Freshness**: All deps < 6 months old

---

**💡 Remember: Code for humans, not just computers!**

**🎯 Goal: Maintainable, practical, type-safe code với phiên bản mới nhất** 