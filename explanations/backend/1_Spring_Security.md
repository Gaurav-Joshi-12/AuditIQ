# Spring Security in Detail

## 1. What is Spring Security?
Spring Security is a powerful, highly customizable framework that handles authentication (who are you?) and authorization (what are you allowed to do?).

## 2. How it works (The Filter Chain)
When an HTTP request arrives at your Spring Boot application, it doesn't go straight to the Controller. It passes through a chain of security filters (the `SecurityFilterChain`).
If a request fails a filter (e.g., no authentication token), it is rejected with a `401 Unauthorized` or `403 Forbidden` status before it ever touches your business logic.

## 3. Our Configuration (`SecurityConfig.java`)
In this project, we heavily customized the security:
- **Stateless Sessions:** We disabled traditional server-side sessions (`SessionCreationPolicy.STATELESS`). The server forgets who you are immediately after the request finishes.
- **CSRF Disabled:** Because we don't use sessions, Cross-Site Request Forgery (CSRF) attacks are impossible, so we disabled CSRF protection.
- **CORS Allowed:** We explicitly allowed our frontend (`http://localhost:3000`) to make requests to our backend without the browser blocking them.
- **Public Routes:** We configured `/api/auth/**` to be publicly accessible (so users can log in).
- **Private Routes:** All other endpoints require a valid authentication token (`.anyRequest().authenticated()`).

## 4. Customizing Authentication
We provided our own `AuthenticationProvider`. We told Spring Security: "When someone tries to log in, use our `CustomUserDetailsService` to find them in the database, and use `BCryptPasswordEncoder` to check if their hashed password matches."
