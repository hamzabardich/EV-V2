package com.example.Routing_Ev.controllers;

import com.example.Routing_Ev.entities.Vehicule;
import com.example.Routing_Ev.repositories.VehiculeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicules")
@CrossOrigin(origins = "http://localhost:5173")
public class VehiculeController {

    @Autowired
    private VehiculeRepository vehiculeRepo;

    @GetMapping
    public List<Vehicule> getAllVehicules() {
        return vehiculeRepo.findAll();
    }

    @GetMapping("/{id}")
    public Vehicule getVehiculeById(@PathVariable Long id) {
        return vehiculeRepo.findById(id).orElse(null);
    }
}