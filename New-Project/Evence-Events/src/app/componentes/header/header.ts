import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Usuario } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  bannersuperiorVisivel = true;
  menuAberto = false;
  dropdownAberto = false;
  usuarioLogado: Usuario | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('usuarioLogado');
      if (stored) {
        this.usuarioLogado = JSON.parse(stored);
      }
    }
  }

  fecharBannerSuperior(): void {
    this.bannersuperiorVisivel = false;
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  toggleDropdown(): void {
    this.dropdownAberto = !this.dropdownAberto;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioLogado');
    }
    this.usuarioLogado = null;
    this.dropdownAberto = false;
    this.menuAberto = false;
    this.router.navigate(['/']);
  }

  getIniciais(nome: string): string {
    if (!nome) return 'U';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  nomeCurto(nome: string): string {
    if (!nome) return '';
    return nome.split(' ')[0];
  }

  isPerfilIncompleto(): boolean {
    if (!this.usuarioLogado) return false;
    
    const u = this.usuarioLogado;
    if (!u.celular || u.celular === '') return true;
    
    if (u.tipoPessoa === 'fisica') {
      if (!u.dataNascimento || u.dataNascimento === 'N/A' || u.dataNascimento === '') return true;
    } else {
      if (!u.nome || u.nome === 'Usuário' || u.nome === '') return true;
    }
    
    return false;
  }
}
