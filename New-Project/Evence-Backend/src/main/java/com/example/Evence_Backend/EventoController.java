package com.example.Evence_Backend; // Verifique se o package bate com o seu projeto

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "http://localhost:4200") // Permite que o Angular (porta 4200) acesse o Java
public class EventoController {

    @GetMapping
    public List<Map<String, String>> listarEventos() {
        // Criando dados simulados para testar a conexão
        return List.of(
            Map.of("nome", "Workshop de Angular", "data", "20/06/2026"),
            Map.of("nome", "Imersão Java Spring", "data", "25/06/2026"),
            Map.of("nome", "Hackathon Evence", "data", "02/07/2026")
        );
    }
}