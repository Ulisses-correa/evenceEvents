import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Eventos {
  nome: string,
  data: string
}


@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-lista-eventos.component',
  imports: [],
  templateUrl: './lista-eventos.component.html',
  styleUrl: './lista-eventos.component.css',
})
export class ListaEventosComponent implements OnInit{

  eventos: any[] = [];
  eventosArray = signal<Eventos[]>([])

  ngOnInit(): void {
    this.listar().subscribe(res => this.eventosArray.set(res))

    this.listar().subscribe({
    next: (res) => {
    // Se você estiver usando Signals do Angular (pelo .set() que vi ali em cima):
    this.eventosArray.set(res); 
    },
    error: (erross: any) => {
    console.error('Erro ao buscar eventos do backend:', erross);
    }
    });
  }

  // URL exata do Controller que criamos no Java
  private apiUrl = 'http://localhost:8080/api/eventos'; 
  private http = inject(HttpClient)

  listar(): Observable<Eventos[]> {
    return this.http.get<Eventos[]>(this.apiUrl);
  }
}
