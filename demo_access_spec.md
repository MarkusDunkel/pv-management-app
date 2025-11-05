# Demo Access Implementation Spec — Vite + Spring Boot + PostgreSQL

## 0) Environment & Dependencies

### Backend (Spring Boot, Java 17+)
- Add dependencies:
  - `io.jsonwebtoken:jjwt-api:0.12.3`
  - `io.jsonwebtoken:jjwt-impl:0.12.3`
  - `io.jsonwebtoken:jjwt-jackson:0.12.3`
  - `org.springframework.boot:spring-boot-starter-web`
  - `org.springframework.boot:spring-boot-starter-jdbc`
  - `org.postgresql:postgresql`
  - Optional rate limiting: `com.github.vladimir-bukhtoyarov:bucket4j-core:8.10.1`

```yaml
server:
  servlet:
    session:
      cookie:
        http-only: true
        secure: true
        name: sid
spring:
  datasource:
    url: jdbc:postgresql://HOST:5432/DB
    username: USER
    password: PASS
  jpa:
    hibernate:
      ddl-auto: none
app:
  demo:
    secret: ${DEMO_SECRET}
    session-max-age-hours: 8
    default-max-activations: 5
```

### Frontend (Vite + TypeScript)
- Security headers:
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Robots-Tag: noindex`

---

## 1) CV & Link Generation

- Create per-company JWT with claims `{org, key_id, scope:"demo"}`.
- Place URL on CV: `https://landing.example.com/?k=<COMPANY_KEY>`.

### Java utility for JWT
```java
public class DemoKeyIssuer {
    public static String issueCompanyKey(String secret, String org, String keyId) {
        var now = new Date();
        var exp = new Date(now.getTime() + Duration.ofDays(180).toMillis());
        var key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .claim("org", org)
                .claim("key_id", keyId)
                .claim("scope", "demo")
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
    }
}
```

---

## 2) Landing Page

```html
<a id="try-demo" href="https://app.example.com/demologin">Try demo</a>
<script type="module">
  const u = new URL(window.location.href);
  const k = u.searchParams.get('k');
  if (k) document.getElementById('try-demo').href =
    `https://app.example.com/demologin?k=${encodeURIComponent(k)}`;
</script>
```

---

## 3) App: `/demologin` Endpoint

**Flow:**
1. Read `k` query param.
2. Validate JWT.
3. Provision or find `role='demo'` user by `org`.
4. Create session cookie (`HttpOnly`, `Secure`, `SameSite=Lax`).
5. Redirect to `/`.
6. On error → `/demo-invalid`.

### Spring Controller
```java
@RestController
public class DemoLoginController {
    @GetMapping("/demologin")
    public void demologin(@RequestParam String k, HttpServletResponse res, HttpSession session) throws Exception {
        var parsed = tokenService.parseAndValidate(k);
        var userId = userService.findOrCreateDemoUser(parsed.org());
        session.setAttribute("uid", userId);
        session.setAttribute("role", "demo");
        Cookie cookie = new Cookie("sid", session.getId());
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(28800);
        res.addCookie(cookie);
        res.addHeader("Set-Cookie", "sid="+session.getId()+"; Path=/; HttpOnly; Secure; SameSite=Lax");
        res.sendRedirect("/");
    }
}
```

---

## 4) Token Service

```java
@Service
public class DemoTokenService {
    public DemoClaims parseAndValidate(String jwt) {
        var key = Keys.hmacShaKeyFor(secret);
        var jws = Jwts.parser().verifyWith(key).build().parseSignedClaims(jwt);
        var claims = jws.getPayload();
        return new DemoClaims(claims.get("org", String.class), claims.get("key_id", String.class), claims.get("scope", String.class));
    }
}
```

---

## 5) Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  org TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('demo','user','admin')),
  expires_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ
);

CREATE TABLE demo_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id TEXT NOT NULL,
  org TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  first_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  activations INT DEFAULT 0,
  max_activations INT DEFAULT 5,
  revoked BOOLEAN DEFAULT FALSE,
  UNIQUE (key_id, org)
);

CREATE TABLE demo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id TEXT NOT NULL,
  org TEXT NOT NULL,
  ts TIMESTAMPTZ DEFAULT NOW(),
  ip TEXT,
  ua TEXT
);
```

---

## 6) Security & Privacy

- Headers: `Referrer-Policy`, `X-Robots-Tag: noindex`
- Rate limit `/demologin`: 30 req/min per IP.
- Log redemptions (`key_id`, `org`, timestamp, IP, UA).

---

## 7) Ops & Lifecycle

- JWT expires in 6 months.
- demo_keys expires in 30 days, max_activations=5.
- Admin CLI or API to issue/revoke keys.

---

## 8) Acceptance Tests

1. Happy path: valid key → redirect `/`.
2. Missing/expired key → `/demo-invalid`.
3. Headers present (`Referrer-Policy`, `noindex`).
4. Audit log created on redemption.
5. Multiple orgs create isolated demo users.
