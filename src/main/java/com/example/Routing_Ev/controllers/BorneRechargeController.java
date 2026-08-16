package com.example.Routing_Ev.controllers;

import com.example.Routing_Ev.entities.BorneRecharge;
import com.example.Routing_Ev.repositories.BorneRechargeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin; // 👈 Nouvel import
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bornes")
@CrossOrigin(origins = "*") // 👈 AUTORISE REACT À LIRE LES BORNES
public class BorneRechargeController {

    @Autowired
    private BorneRechargeRepository borneRepo;

    // 1. Route pour lister toutes les bornes de recharge
    @GetMapping
    public List<BorneRecharge> getAllBornes() {
        return borneRepo.findAll();
    }

    // 2. Route pour récupérer une borne spécifique grâce à son ID
    @GetMapping("/{id}")
    public BorneRecharge getBorneById(@PathVariable Long id) {
        return borneRepo.findById(id).orElse(null);
    }
}