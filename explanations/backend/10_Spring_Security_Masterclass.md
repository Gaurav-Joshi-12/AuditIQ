# Spring Security Masterclass: The Ultimate Interview Guide

This document is a "one-shot" masterclass covering Spring Security from the absolute basics to extreme, low-level architecture details. Use this as your primary study guide for interviews.

---

## 1. The Core Concepts: Authentication vs. Authorization

Before diving into the architecture, you must understand the difference between the two "A"s of security:
- **Authentication (Who are you?):** The process of verifying a user's identity. *Example: Logging in with an email and password to prove you are Gaurav.*
- **Authorization (What can you do?):** The process of verifying if an authenticated user has permission to perform an action. *Example: Checking if Gaurav has the `ROLE_AUDITOR` permission before allowing him to view financial reports.*

Spring Security handles BOTH.

---

## 2. The Low-Level Architecture: The Filter Chain

When an HTTP request enters a Spring Boot application, it DOES NOT go straight to your `@RestController`. It must survive a gauntlet of filters.

### A) DelegatingFilterProxy
In a standard Java web application, security is handled by Servlet Filters. Spring Security registers a standard Servlet Filter called `DelegatingFilterProxy`. Its only job is to intercept the raw HTTP request and hand it over to Spring's internal bean system.

### B) FilterChainProxy
The `DelegatingFilterProxy` passes the request to the `FilterChainProxy`. This is the true starting point of Spring Security. It manages multiple `SecurityFilterChain`s and decides which one should process the current request.

### C) SecurityFilterChain
This is the actual list of security filters the request must pass through. Some of the most important built-in filters include:
1. **`CorsFilter`:** Checks Cross-Origin Resource Sharing rules (e.g., "Is `localhost:3000` allowed to call this API?").
2. **`CsrfFilter`:** Checks for Cross-Site Request Forgery tokens (we disable this for JWT APIs).
3. **`UsernamePasswordAuthenticationFilter`:** If a user submits a login form, this filter intercepts it and tries to log them in.
4. **`BasicAuthenticationFilter`:** Checks for Basic Auth headers.
5. **`BearerTokenAuthenticationFilter` / Our Custom `JwtFilter`:** We inject our own filter here to intercept JWTs.
6. **`ExceptionTranslationFilter`:** Catches any security exceptions (like a user trying to access a page without a token) and translates them into HTTP responses (e.g., `401 Unauthorized`).
7. **`FilterSecurityInterceptor`:** The final boss. It checks if the authenticated user has the required roles to access the requested URL.

---

## 3. The Authentication Flow (Step-by-Step)

If an interviewer asks: *"Explain the exact flow of Authentication in Spring Security,"* give them this exact sequence:

1. **The Request:** The user submits their email and password.
2. **Authentication Token:** The filter extracts the credentials and creates an unauthenticated `UsernamePasswordAuthenticationToken` object.
3. **AuthenticationManager:** The token is passed to the `AuthenticationManager` (the main coordinator). Its job is simply to find an `AuthenticationProvider` that knows how to verify this token.
4. **AuthenticationProvider:** The `AuthenticationProvider` does the actual heavy lifting. It needs to check the database and compare passwords.
5. **UserDetailsService:** The Provider calls the `UserDetailsService` (which we implemented as `CustomUserDetailsService`). It calls `loadUserByUsername(email)` to fetch the user's hashed password and roles from our PostgreSQL database.
6. **PasswordEncoder:** The Provider takes the raw password the user typed, hashes it using `BCryptPasswordEncoder`, and compares it to the hashed password retrieved from the database.
7. **Success & SecurityContext:** If the passwords match, the Provider returns a fully authenticated `Authentication` object. This object is stored in the `SecurityContextHolder`.

*Once a user is in the `SecurityContextHolder`, Spring officially considers them "logged in" for the duration of that request.*

---

## 4. JWT & Stateless Sessions (Why we disabled CSRF)

In a traditional website, when you log in, the server creates a **Session** in its memory and gives your browser a `JSESSIONID` cookie. Because browsers automatically send cookies with every request, hackers can trick your browser into making unauthorized requests (This is a **CSRF** attack). To stop this, traditional Spring Security uses CSRF tokens.

**However, AuditIQ uses a REST API with JWTs.**
- We configure Spring to be **STATELESS** (`SessionCreationPolicy.STATELESS`). The server completely forgets the user the millisecond the request ends.
- The browser DOES NOT use cookies. Instead, the React frontend manually attaches the JWT to the `Authorization: Bearer <token>` header using Axios.
- **Because we don't use sessions or cookies, CSRF attacks are technically impossible.** Therefore, we write `.csrf(csrf -> csrf.disable())` in our `SecurityConfig`. Leaving it enabled would break our API for no security benefit.

---

## 5. Method-Level Security

While we secure URLs in `SecurityConfig` (e.g., `.requestMatchers("/api/admin/**").hasRole("ADMIN")`), Spring Security also allows us to secure individual Java methods.

By adding `@EnableMethodSecurity` to our config, we can use annotations directly on our Service or Controller methods:
- `@PreAuthorize("hasRole('ROLE_AUDITOR')")`: Spring will intercept the method call and block it if the user isn't an Auditor.
- `@PostAuthorize("returnObject.owner == authentication.name")`: Runs the method, but blocks the return value if the current user doesn't own the data.

---

## 6. Interview Q&A Cheatsheet

### Q1: What is the `SecurityContextHolder`?
**A:** "It is the most fundamental object in Spring Security. It uses a `ThreadLocal` to store the details of the currently authenticated user. Anywhere in my application—whether in a controller or a deeply nested service—I can call `SecurityContextHolder.getContext().getAuthentication()` to instantly see who is currently making the request."

### Q2: Why did you use `BCryptPasswordEncoder`?
**A:** "BCrypt is an industry-standard hashing algorithm. Unlike simple hashing algorithms like MD5 or SHA-256, BCrypt automatically generates a random 'salt' for every password and incorporates a 'work factor' that deliberately slows down the hashing process. This makes brute-force or dictionary attacks exponentially harder for hackers."

### Q3: How did you implement JWT validation in your filter chain?
**A:** "I created a custom `JwtFilter` that extends `OncePerRequestFilter`. I injected this filter into the `SecurityFilterChain` *before* the standard `UsernamePasswordAuthenticationFilter`. For every request, my filter checks the `Authorization` header. If a valid JWT is found, it extracts the email, loads the user from the database via my `CustomUserDetailsService`, and manually places an `UsernamePasswordAuthenticationToken` into the `SecurityContextHolder`. This tells Spring the user is authenticated for this specific, stateless request."

### Q4: What is the difference between `@Secured` and `@PreAuthorize`?
**A:** "`@Secured` is a legacy annotation that only checks roles. `@PreAuthorize` is the modern, much more powerful alternative that supports SpEL (Spring Expression Language). With `@PreAuthorize`, I can write complex logic like `@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")`."

### Q5: Can you explain CORS and how Spring Security handles it?
**A:** "CORS (Cross-Origin Resource Sharing) is a security mechanism enforced by the *browser*, not the server. It prevents a malicious website on `evil.com` from making an AJAX request to our API on `localhost:8082`. Because our React frontend runs on port `3000`, the browser sees it as a different origin. In Spring Security, we must explicitly configure a `CorsConfigurationSource` to tell the browser: 'Yes, it is safe to let `localhost:3000` interact with this API.'"
