package com.auditiq.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that executes on every HTTP request.
 * It checks for the "Authorization" header, extracts the JWT, and if valid,
 * tells Spring Security that the user is authenticated.
 */
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String email = null;
        String jwt = null;

        // 1. Check if the Authorization header is present and starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7); // Remove "Bearer " prefix
            try {
                email = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // Invalid token signature or expired
                logger.error("JWT validation failed: " + e.getMessage());
            }
        }

        // 2. If we found an email, and there is no authentication in the context yet
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);

            // 3. Validate the token against the user details
            if (jwtUtil.validateToken(jwt, userDetails)) {
                // Create an authentication token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 4. Put the authentication into the Security Context (logs the user in for this request)
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 5. Continue down the filter chain
        filterChain.doFilter(request, response);
    }
}
