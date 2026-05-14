import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from "@angular/router";
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Usuario } from '../../interfaces/usuario.interface';

import { Evento } from '../../interfaces/evento.interface';
import { EventosService } from '../../services/services';

interface Colecao {
  id: string;
  nome: string;
  icone: string;
}

import { HeaderComponent } from '../../componentes/header/header';
import { FooterComponent } from '../../componentes/footer/footer';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPageComponent implements OnInit, OnDestroy {
  buscaTermo = '';
  slideAtual = 0;
  autoplayInterval: any;

  eventos: Evento[] = [];
  eventoEmDestaque: Evento | null = null;
  cidades: string[] = [];
  cidadeSelecionada = 'todas';
  private subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {}

  colecoes: Colecao[] = [
    { id: 'shows', nome: 'Festas e Shows', icone: 'music_note' },
    { id: 'teatro', nome: 'Teatros e Espetáculos', icone: 'theater_comedy' },
    { id: 'standup', nome: 'Stand Up', icone: 'mic' },
    { id: 'esportes', nome: 'Esportes', icone: 'sports_soccer' },
    { id: 'gastronomia', nome: 'Gastronomia', icone: 'restaurant' },
    { id: 'cultura', nome: 'Arte e Cultura', icone: 'palette' },
  ];

  ngOnInit(): void {
    this.carregarEventosDestaque();
  }

  carregarEventosDestaque(): void {
    console.log('[LandingPage] Iniciando busca de eventos...');
    const sub = this.eventosService.getEventos().subscribe({
      next: (todos) => {
        console.log('[LandingPage] Eventos recebidos:', todos ? todos.length : 0);
        if (!todos) return;
        // Pega os destaques e limita a 10
        this.eventos = todos.filter(e => e.destaque).slice(0, 10);
        console.log('[LandingPage] Eventos em destaque:', this.eventos.length);
        
        // Extrai as cidades únicas de todos os eventos para o filtro
        const cidadesSet = new Set(todos.map(e => e.cidade));
        this.cidades = Array.from(cidadesSet).sort();

        if (this.eventos.length > 0) {
          this.eventoEmDestaque = this.eventos[0];
          this.iniciarAutoplay();
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[LandingPage] Erro ao carregar destaques:', err)
    });
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.pararAutoplay();
    this.subscription.unsubscribe();
  }

  iniciarAutoplay(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.pararAutoplay();
      this.autoplayInterval = setInterval(() => {
        this.proximoSlide();
      }, 5000);
    }
  }

  pararAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  proximoSlide(): void {
    if (this.eventos.length === 0) return;
    this.slideAtual = (this.slideAtual + 1) % this.eventos.length;
    this.eventoEmDestaque = this.eventos[this.slideAtual];
  }

  slideAnterior(): void {
    if (this.eventos.length === 0) return;
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

  buscar(): void {
    const queryParams: any = {};
    if (this.buscaTermo.trim()) {
      queryParams.q = this.buscaTermo.trim();
    }
    if (this.cidadeSelecionada !== 'todas') {
      queryParams.cidade = this.cidadeSelecionada;
    }
    this.router.navigate(['/eventos'], { queryParams });
  }
}
