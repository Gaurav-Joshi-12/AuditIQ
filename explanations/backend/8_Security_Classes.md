# Security Classes in Extreme Detail

Since you are new to JWT, let's break down exactly how the 3 custom security classes in our project work together.

## 1. `JwtUtil.java` (The Cryptographer)
Think of this class as our cryptographic engine.
- **`generateToken(String email, String role, Long id)`:** It takes the user's data, sets an expiration date (e.g., 24 hours from now), and signs it using our secret `gemini.api.key` (or any secure secret). It returns the long JWT string.
- **`extractEmail(String token)`:** Given a token string from a user, it uses the secret key to decrypt/verify it. If the token hasn't been tampered with, it returns the email inside. If it was tampered with, it throws an exception and the request dies.
- **`validateToken(...)`:** A quick check to ensure the token isn't expired and the email matches the database.

## 2. `CustomUserDetailsService.java` (The Database Bridge)
Spring Security needs to know how to load a user from the database.
- It implements `UserDetailsService`.
- The `loadUserByUsername` method receives an email, uses our `UserRepository` to find the `User` entity, and converts it into a `UserDetails` object that Spring Security can understand. It also maps our `role` string (e.g., `ROLE_AUDITOR`) into Spring Security `SimpleGrantedAuthority` objects.

## 3. `JwtFilter.java` (The Bouncer)
This is the most critical piece. It extends `OncePerRequestFilter`, meaning it runs exactly once for every single API request.
1. It intercepts the HTTP request and checks the headers.
2. It looks for the `Authorization` header. If it doesn't exist, or doesn't start with `"Bearer "`, it skips and moves on (which will likely result in a 403 Forbidden later).
3. If it finds a token, it strips the `"Bearer "` prefix.
4. It calls `JwtUtil.extractEmail(token)`.
5. It calls `CustomUserDetailsService.loadUserByUsername(email)` to load the user's permissions from the database.
6. It calls `JwtUtil.validateToken()`.
7. If everything is perfect, it creates an `UsernamePasswordAuthenticationToken` and places it inside the `SecurityContextHolder`.
8. By placing it in the `SecurityContextHolder`, it tells the entire Spring Framework: "I have personally verified this user. You may allow them to access the protected endpoints."
