package com.example.Routing_Ev.repositories;

import com.example.Routing_Ev.entities.BorneRecharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorneRechargeRepository extends JpaRepository<BorneRecharge, Long> {
    @Query(value = "SELECT * FROM borne_recharge b WHERE ST_DWithin(" +
            "CAST(b.localisation AS geography), " +
            "CAST(ST_SetSRID(ST_GeomFromGeoJSON(:routeGeoJson), 4326) AS geography), " +
            ":rayonEnMetres)",
            nativeQuery = true)
    List<BorneRecharge> findBornesAutourDuTrajet(
            @Param("routeGeoJson") String routeGeoJson,
            @Param("rayonEnMetres") double rayonEnMetres);

}
