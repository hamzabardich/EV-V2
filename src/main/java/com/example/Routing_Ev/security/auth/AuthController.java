package com.example.Routing_Ev.security.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationService service;

    public AuthController(AuthenticationService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthObjets.AuthenticationResponse> register(
            @RequestBody AuthObjets.RegisterRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthObjets.AuthenticationResponse> authenticate(
            @RequestBody AuthObjets.AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}