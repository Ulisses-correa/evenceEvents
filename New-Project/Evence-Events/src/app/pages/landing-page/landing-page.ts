import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

interface Evento {
  id: number;
  titulo: string;
  local: string;
  data: string;
  imagem: string;
  destaque?: boolean;
}

interface Colecao {
  id: number;
  nome: string;
  icone: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPageComponent implements OnInit, OnDestroy {
  menuAberto = false;
  bannersuperiorVisivel = true;
  buscaTermo = '';
  slideAtual = 0;
  autoplayInterval: any;

  eventos: Evento[] = [
    {
      id: 1,
      titulo: 'Festival de Verão 2026',
      local: 'São Paulo, SP',
      data: '15 Jan 2026',
      imagem: '',
      destaque: true,
    },
    {
      id: 2,
      titulo: 'Show do Ano',
      local: 'Rio de Janeiro, RJ',
      data: '22 Jan 2026',
      imagem: '',
    },
    {
      id: 3,
      titulo: 'Noite de Gala',
      local: 'Belo Horizonte, MG',
      data: '30 Jan 2026',
      imagem: '',
    },
  ];

  colecoes: Colecao[] = [
    { id: 1, nome: 'Festas e Shows', icone: 'music_note' },
    { id: 2, nome: 'Teatros e Espetáculos', icone: 'theater_comedy' },
    { id: 3, nome: 'Stand Up', icone: 'mic' },
    { id: 4, nome: 'Esportes', icone: 'sports_soccer' },
    { id: 5, nome: 'Gastronomia', icone: 'restaurant' },
    { id: 6, nome: 'Arte e Cultura', icone: 'palette' },
  ];

  eventoEmDestaque: Evento = this.eventos[0];

  ngOnInit(): void {
    this.iniciarAutoplay();
  }

  ngOnDestroy(): void {
    this.pararAutoplay();
  }

  iniciarAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.proximoSlide();
    }, 4000);
  }

  pararAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  proximoSlide(): void {
    this.slideAtual = (this.slideAtual + 1) % this.eventos.length;
    this.eventoEmDestaque = this.eventos[this.slideAtual];
  }

  slideAnterior(): void {
    this.slideAtual =
      (this.slideAtual - 1 + this.eventos.length) % this.eventos.length;
    this.eventoEmDestaque = this.eventos[this.slideAtual];
  }

  irParaSlide(index: number): void {
    this.slideAtual = index;
    this.eventoEmDestaque = this.eventos[index];
    this.pararAutoplay();
    this.iniciarAutoplay();
  }

  fecharBannerSuperior(): void {
    this.bannersuperiorVisivel = false;
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  buscar(): void {
    console.log('Buscando:', this.buscaTermo);
  }
}
