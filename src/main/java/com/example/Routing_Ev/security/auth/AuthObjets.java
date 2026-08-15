package com.example.Routing_Ev.security.auth;

// On regroupe les 3 petits objets ici pour ne pas créer trop de fichiers.
// (Les "records" en Java sont parfaits pour transporter des données simplement).

public class AuthObjets {

    // Ce que le Frontend envoie pour créer un compte
    public record RegisterRequest(String nom, String email, String password) {}

    // Ce que le Frontend envoie pour se connecter
    public record AuthenticationRequest(String email, String password) {}

    // Ce que le Backend renvoie (Le fameux Token JWT)
    public record AuthenticationResponse(String token) {}
}