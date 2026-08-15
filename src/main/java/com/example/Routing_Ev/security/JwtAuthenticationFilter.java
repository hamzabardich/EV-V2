package com.example.Routing_Ev.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // --- DEBUG ---
        System.out.println("--------------------------------------------------");
        System.out.println("Requête interceptée sur l'URL : " + request.getRequestURI());

        // 1. On cherche le token dans l'en-tête "Authorization"
        final String authHeader = request.getHeader("Authorization");
        System.out.println("Header Authorization reçu : " + authHeader);

        final String jwt;
        final String userEmail;

        // 2. Si y'a pas de token (ou s'il commence pas par "Bearer ")
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println(">>> ERREUR : Pas de header Authorization ou ne commence pas par 'Bearer ' !");
            filterChain.doFilter(request, response);
            return;
        }

        // 3. On extrait le token (en enlevant "Bearer ")
        jwt = authHeader.substring(7);
        try {
            userEmail = jwtService.extractUsername(jwt);
            System.out.println("Email extrait du Token : " + userEmail);
        } catch (Exception e) {
            System.out.println(">>> ERREUR : Impossible d'extraire l'email du token ! " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Si on a un email et que la personne n'est pas encore identifiée
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            System.out.println("Utilisateur chargé depuis la BDD : " + userDetails.getUsername());

            // 5. On vérifie si le token est toujours valide
            if (jwtService.isTokenValid(jwt, userDetails)) {
                System.out.println(">>> SUCCÈS : Le token est valide ! Connexion acceptée.");
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.out.println(">>> ERREUR : Le token est invalide pour cet utilisateur !");
            }
        }

        filterChain.doFilter(request, response);
    }
}