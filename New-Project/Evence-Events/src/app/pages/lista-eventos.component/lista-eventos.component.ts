/* ================================================================
   EVENCE EVENTS — Lista de Eventos Component
   Gerencia filtros, busca, ordenação e estado dos eventos
   ================================================================ */

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Inject, PLATFORM_ID } from '@angular/core';

/* ----------------------------------------------------------------
   Interfaces de dados
   ---------------------------------------------------------------- */

import { Evento, Categoria, OpcaoOrdenacao } from '../../interfaces/evento.interface';
import { EventosService } from '../../services/services';
import { Usuario } from '../../interfaces/usuario.interface';

import { HeaderComponent } from '../../componentes/header/header';
import { FooterComponent } from '../../componentes/footer/footer';

@Component({
  selector: 'app-lista-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './lista-eventos.component.html',
  styleUrl: './lista-eventos.component.css',
})
export class ListaEventosComponent implements OnInit {

  /* ----------------------------------------------------------------
  /** Controla se o painel de filtros lateral está visível (mobile) */
  filtrosMobileAberto = false;

  /** Controla se o painel de filtros lateral está visível (desktop) */
  filtrosPainelVisivel = true;

  /** Modo de visualização: 'grid' ou 'lista' */
  modoVisualizacao: 'grid' | 'lista' = 'grid';

  /** Termo digitado na busca */
  buscaTermo = '';

  /** Categoria selecionada no filtro */
  categoriaAtiva = 'todas';

  /** Cidade selecionada no filtro */
  cidadeAtiva = 'todas';

  /** Ordenação selecionada */
  ordenacaoAtiva = 'relevancia';

  /** Faixa de preço máximo selecionada */
  precoMaximo = 1000;

  /** Controla se apenas eventos com ingressos disponíveis são exibidos */
  apenasDisponiveis = false;

  /* ----------------------------------------------------------------
     Dados de referência
     ---------------------------------------------------------------- */

  /** Categorias disponíveis para filtro */
  categorias: Categoria[] = [];

  /** Lista de cidades únicas extraídas dos eventos */
  cidades: string[] = [];

  /** Opções de ordenação disponíveis */
  readonly opcoesOrdenacao: OpcaoOrdenacao[] = [
    { valor: 'relevancia', label: 'Relevância' },
    { valor: 'data-asc',   label: 'Data (mais próxima)' },
    { valor: 'data-desc',  label: 'Data (mais distante)' },
    { valor: 'preco-asc',  label: 'Menor preço' },
    { valor: 'preco-desc', label: 'Maior preço' },
  ];

  /** Banco de eventos simulados */
  todosEventos: Evento[] = [];

  /** Banco de usuários para pegar info do produtor */
  produtores: Usuario[] = [];

  /* ----------------------------------------------------------------
     Estado computado
     ---------------------------------------------------------------- */

  /** Lista filtrada e ordenada exibida na tela */
  eventosFiltrados: Evento[] = [];

  constructor(
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.buscaTermo = params['q'];
        this.aplicarFiltros();
      }
      if (params['categoria']) {
        this.categoriaAtiva = params['categoria'];
        this.aplicarFiltros();
      }
      if (params['cidade']) {
        this.cidadeAtiva = params['cidade'];
        this.aplicarFiltros();
      }
    });

    this.eventosService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar categorias:', err);
      }
    });

    this.eventosService.getEventos().subscribe({
      next: (eventos) => {
        this.todosEventos = eventos || [];
        this.extrairCidades();
        // Aplica os filtros iniciais ao carregar os dados
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar eventos:', err);
        this.todosEventos = [];
        this.aplicarFiltros();
        this.cdr.detectChanges();
      }
    });

    this.eventosService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.produtores = usuarios || [];
        // Patch com o usuário logado do localStorage (foto pode estar mais atualizada)
        if (isPlatformBrowser(this.platformId)) {
          const stored = localStorage.getItem('usuarioLogado');
          if (stored) {
            try {
              const userLocal: Usuario = JSON.parse(stored);
              const idx = this.produtores.findIndex(p => String(p.id) === String(userLocal.id));
              if (idx !== -1) {
                this.produtores[idx] = { ...this.produtores[idx], ...userLocal };
              }
            } catch (e) {}
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
      }
    });
  }

  /* ----------------------------------------------------------------
     Métodos de filtro e busca
     ---------------------------------------------------------------- */

  /** Seleciona uma categoria e reaplicar os filtros */
  selecionarCategoria(id: string): void {
    this.categoriaAtiva = id;
    this.aplicarFiltros();
  }

  /** Seleciona uma cidade e reaplica os filtros */
  selecionarCidade(cidade: string): void {
    this.cidadeAtiva = cidade;
    this.aplicarFiltros();
  }

  /** Extrai as cidades únicas dos eventos carregados */
  private extrairCidades(): void {
    const cidadesSet = new Set(this.todosEventos.map(e => e.cidade));
    this.cidades = Array.from(cidadesSet).sort();
  }

  /** Muda a ordenação e reaplicar os filtros */
  mudarOrdenacao(valor: string): void {
    this.ordenacaoAtiva = valor;
    this.aplicarFiltros();
  }

  /** Chamado quando o usuário digita na busca */
  onBuscaChange(): void {
    this.aplicarFiltros();
  }

  /** Limpa o campo de busca e reaplicar os filtros */
  limparBusca(): void {
    this.buscaTermo = '';
    this.aplicarFiltros();
  }

  /** Aplica todos os filtros e ordenações ativos */
  aplicarFiltros(): void {
    let resultado = [...this.todosEventos];

    // --- Filtro por busca (título, local, cidade) ---
    if (this.buscaTermo.trim()) {
      const termo = this.buscaTermo.toLowerCase().trim();
      resultado = resultado.filter(e =>
        e.titulo.toLowerCase().includes(termo) ||
        e.local.toLowerCase().includes(termo) ||
        e.cidade.toLowerCase().includes(termo)
      );
    }

    // --- Filtro por categoria ---
    if (this.categoriaAtiva !== 'todas') {
      resultado = resultado.filter(e => e.categoria === this.categoriaAtiva);
    }

    // --- Filtro por cidade ---
    if (this.cidadeAtiva !== 'todas') {
      resultado = resultado.filter(e => e.cidade === this.cidadeAtiva);
    }

    // --- Filtro por preço máximo ---
    resultado = resultado.filter(e => e.precoMinimo <= this.precoMaximo);

    // --- Filtro de disponibilidade ---
    if (this.apenasDisponiveis) {
      resultado = resultado.filter(e => !e.esgotado);
    }

    // --- Ordenação ---
    resultado = this.ordenar(resultado, this.ordenacaoAtiva);

    this.eventosFiltrados = resultado;
  }

  /** Retorna a lista ordenada pelo critério escolhido */
  private ordenar(lista: Evento[], criterio: string): Evento[] {
    return [...lista].sort((a, b) => {
      switch (criterio) {
        case 'data-asc':
          return a.dataISO.localeCompare(b.dataISO);
        case 'data-desc':
          return b.dataISO.localeCompare(a.dataISO);
        case 'preco-asc':
          return a.precoMinimo - b.precoMinimo;
        case 'preco-desc':
          return b.precoMinimo - a.precoMinimo;
        default:
          // Relevância: destaques primeiro, depois por data
          if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
          return a.dataISO.localeCompare(b.dataISO);
      }
    });
  }

  /* ----------------------------------------------------------------
     Métodos utilitários
     ---------------------------------------------------------------- */

  /** Alterna o modo de visualização entre grade e lista */
  alternarVisualizacao(modo: 'grid' | 'lista'): void {
    this.modoVisualizacao = modo;
  }

  /** Abre/fecha o painel de filtros no mobile */
  toggleFiltrosMobile(): void {
    this.filtrosMobileAberto = !this.filtrosMobileAberto;
  }

  /** Abre/fecha o painel de filtros lateral no desktop */
  toggleFiltrosPainel(): void {
    this.filtrosPainelVisivel = !this.filtrosPainelVisivel;
  }

  /** Formata um valor em reais (BRL) */
  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  /** Calcula o percentual de ingressos vendidos */
  percentualVendido(evento: Evento): number {
    return Math.round((evento.vendidos / evento.totalIngressos) * 100);
  }

  /** Retorna true se o evento está quase esgotado (>85% vendido) */
  quaseEsgotado(evento: Evento): boolean {
    return !evento.esgotado && this.percentualVendido(evento) >= 85;
  }

  /** Getter: total de eventos encontrados */
  get totalEncontrados(): number {
    return this.eventosFiltrados.length;
  }

  /** Getter: label da categoria ativa */
  get labelCategoriaAtiva(): string {
    return this.categorias.find(c => c.id === this.categoriaAtiva)?.nome ?? 'Todas';
  }

  nomeCurto(nome: string): string {
    if (!nome) return '';
    return nome.split(' ')[0];
  }

  /** Métodos para buscar info do produtor e categoria no card */
  getProdutorNome(produtorId?: number | string): string {
    if (!produtorId) return 'Produtor Desconhecido';
    const prod = this.produtores.find(p => String(p.id) === String(produtorId));
    return prod ? (prod.nomeEmpresa || prod.nome) : 'Produtor Desconhecido';
  }

  getProdutorFoto(produtorId?: number | string): string | undefined {
    if (!produtorId) return undefined;
    const prod = this.produtores.find(p => String(p.id) === String(produtorId));
    return prod?.foto;
  }

  getCategoriaNome(categoriaId: string): string {
    const cat = this.categorias.find(c => c.id === categoriaId);
    return cat ? cat.nome : 'Categoria Geral';
  }
}
