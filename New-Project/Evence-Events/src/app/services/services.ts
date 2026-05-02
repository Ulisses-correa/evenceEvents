import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento, Categoria } from '../interfaces/evento.interface';
import { Usuario } from '../interfaces/usuario.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos`);
  }

  getEventoById(id: string | number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/eventos/${id}`);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  // --- Autenticação Simples (JSON Server) ---
  
  login(email: string, senha: string): Observable<Usuario | null> {
    // Busca usuários com e-mail e senha exatos
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios?email=${email}&senha=${senha}`).pipe(
      map(usuarios => usuarios.length > 0 ? usuarios[0] : null)
    );
  }

  cadastro(usuario: Usuario): Observable<Usuario> {
    // No json-server real, precisaríamos checar se o email existe antes. 
    // Por simplicidade na demo, faremos o POST direto.
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, usuario);
  }
}
