import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento, Categoria } from '../interfaces/evento.interface';
import { Usuario } from '../interfaces/usuario.interface';
import { ItemCarrinho } from '../interfaces/carrinho.interface';
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

  getEventosByProdutor(produtorId: string | number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos?produtorId=${produtorId}`);
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

  patchEvento(id: string | number, dados: Partial<Evento>): Observable<Evento> {
    return this.http.patch<Evento>(`${this.apiUrl}/eventos/${id}`, dados);
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

  getSolicitacoesByProdutor(produtorId: string | number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/solicitacoes?produtorId=${produtorId}`);
  }

  atualizarSolicitacao(id: string | number, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/solicitacoes/${id}`, evento);
  }

  deletarSolicitacao(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/solicitacoes/${id}`);
  }

  // --- Gerenciamento do Carrinho (Database) ---

  getCarrinho(usuarioId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/carrinho?usuarioId=${usuarioId}`);
  }

  buscarItemCarrinho(usuarioId: number | string, eventoId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/carrinho?usuarioId=${usuarioId}&eventoId=${eventoId}`);
  }

  salvarItemCarrinho(item: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/carrinho`, item);
  }

  atualizarItemCarrinho(id: number | string, item: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/carrinho/${id}`, item);
  }

  removerItemCarrinho(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/carrinho/${id}`);
  }

  // --- Ingressos Comprados ---

  getIngressos(usuarioId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ingressos?usuarioId=${usuarioId}`);
  }

  salvarIngresso(ingresso: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ingressos`, ingresso);
  }

  deletarIngresso(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ingressos/${id}`);
  }
}
