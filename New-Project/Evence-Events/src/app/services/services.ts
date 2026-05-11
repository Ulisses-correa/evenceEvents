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

  // --- Gerenciamento de Eventos (Admin) ---

  criarEvento(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(`${this.apiUrl}/eventos`, evento);
  }

  atualizarEvento(id: string | number, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/eventos/${id}`, evento);
  }

  deletarEvento(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eventos/${id}`);
  }

  // --- Gerenciamento de Usuários (Admin) ---

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`);
  }

  getUsuarioById(id: string | number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`);
  }

  atualizarUsuario(id: string | number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  deletarUsuario(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`);
  }

  // --- Solicitações de Eventos (Curadoria) ---

  getSolicitacoes(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/solicitacoes`);
  }

  getSolicitacaoById(id: string | number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/solicitacoes/${id}`);
  }

  enviarSolicitacao(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(`${this.apiUrl}/solicitacoes`, evento);
  }

  deletarSolicitacao(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/solicitacoes/${id}`);
  }
}
