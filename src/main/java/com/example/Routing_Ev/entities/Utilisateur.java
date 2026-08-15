package com.example.Routing_Ev.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String role = "USER";

    @OneToMany(mappedBy = "utilisateur")
    private List<Trajet> trajetsHistorique;

    // =================================================================
    // --- MÉTHODES OBLIGATOIRES DE SPRING SECURITY (UserDetails) ---
    // =================================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // On donne le rôle de l'utilisateur à Spring Security (ex: ROLE_USER)
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getUsername() {
        return email; // Pour nous, l'identifiant unique de connexion est l'email !
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}