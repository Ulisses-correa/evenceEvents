import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventosService } from '../../services/services';
import { Evento } from '../../interfaces/evento.interface';
import { Usuario } from '../../interfaces/usuario.interface';

import { HeaderComponent } from '../../componentes/header/header';
import { FooterComponent } from '../../componentes/footer/footer';

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './detalhes.html',
  styleUrl: './detalhes.css'
})
export class DetalhesComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  produtor: Usuario | null = null;
  carregando = true;
  erro = false;
  totalEventosProdutor = 0;
  modoAdmin = false;
  processando = false;

  quantidade = 1;
  loteSelecionado: any = null;

  // Carousel
  imagemAtivaIndex = 0;
  timerCarousel: any;

  // Modal de Imagem
  imagemAberta: string | null = null;
  imagemModalIndex = 0;
  zoomAtivo = false;
  posicaoZoom = { x: 0, y: 0 };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.modoAdmin = data['modoAdmin'] === true;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      
      if (id) {
        this.carregarEvento(id, this.modoAdmin);
      } else {
        this.erro = true;
        this.carregando = false;
      }
    });

    this.iniciarAutoplay();
  }

  ngOnDestroy(): void {
    if (this.timerCarousel) {
      clearInterval(this.timerCarousel);
    }
  }

  iniciarAutoplay(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.timerCarousel = setInterval(() => {
        this.proximaImagem();
      }, 5000);
    }
  }

  proximaImagem(): void {
    if (this.evento?.imagens && this.evento.imagens.length > 1) {
      this.imagemAtivaIndex = (this.imagemAtivaIndex + 1) % this.evento.imagens.length;
      this.cdr.detectChanges();
    }
  }

  irParaImagem(index: number): void {
    this.imagemAtivaIndex = index;
    // Reset timer when user manually interacts
    if (this.timerCarousel) {
      clearInterval(this.timerCarousel);
      this.iniciarAutoplay();
    }
    this.cdr.detectChanges();
  }

  aprovar(): void {
    if (!this.evento || this.processando) return;
    this.processando = true;
    
    this.eventosService.criarEvento(this.evento).subscribe({
      next: () => {
        this.eventosService.deletarSolicitacao(this.evento!.id).subscribe({
          next: () => this.router.navigate(['/admin'], { queryParams: { tab: 'aprovacoes', success: 'Evento aprovado com sucesso!' } }),
          error: () => this.processando = false
        });
      },
      error: () => this.processando = false
    });
  }

  reprovar(): void {
    if (!this.evento || this.processando) return;
    if (!confirm('Tem certeza que deseja reprovar e excluir esta solicitação?')) return;
    
    this.processando = true;
    this.eventosService.deletarSolicitacao(this.evento.id).subscribe({
      next: () => this.router.navigate(['/admin'], { queryParams: { tab: 'aprovacoes', success: 'Solicitação removida.' } }),
      error: () => this.processando = false
    });
  }

  carregarEvento(id: string, isPreview: boolean = false): void {
    this.carregando = true;
    
    const request = isPreview 
      ? this.eventosService.getSolicitacaoById(id)
      : this.eventosService.getEventoById(id);

    request.subscribe({
      next: (dados) => {
        this.evento = dados;
        this.imagemAtivaIndex = 0;
        
        if (this.evento?.lotes && this.evento.lotes.length > 0) {
          this.loteSelecionado = this.evento.lotes[0];
        }
        if (this.evento?.produtorId) {
          this.eventosService.getUsuarioById(this.evento.produtorId).subscribe({
            next: (produtor) => {
              this.produtor = produtor;
              
              // Buscar contagem real de eventos do produtor
              if (this.produtor && this.produtor.id) {
                this.eventosService.getEventosByProdutor(this.produtor.id).subscribe({
                  next: (eventos) => {
                    this.totalEventosProdutor = eventos.length;
                    this.carregando = false;
                    this.cdr.detectChanges();
                  },
                  error: () => {
                    this.carregando = false;
                    this.cdr.detectChanges();
                  }
                });
              } else {
                this.carregando = false;
                this.cdr.detectChanges();
              }
            },
            error: () => {
              this.carregando = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.carregando = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar o evento:', err);
        this.erro = true;
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aumentarQuantidade(): void {
    if (this.evento && this.quantidade < 10) {
      this.quantidade++;
    }
  }

  diminuirQuantidade(): void {
    if (this.quantidade > 1) {
      this.quantidade--;
    }
  }

  adicionarAoCarrinho(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const storedUser = localStorage.getItem('usuarioLogado');
    if (!storedUser) {
      this.router.navigate(['/login']);
      return;
    }

    const usuario: Usuario = JSON.parse(storedUser);
    const userId = usuario.id || 0;

    if (this.evento) {
      this.processando = true;
      
      // Busca se já existe este evento no carrinho do usuário
      this.eventosService.buscarItemCarrinho(userId, this.evento.id).subscribe({
        next: (itens) => {
          const setorAtual = this.loteSelecionado ? this.loteSelecionado.nome : 'Ingresso Geral';
          // Procura especificamente se ESTE LOTE já está no carrinho
          const itemExistente = itens.find(i => i.setor === setorAtual);

          if (itemExistente) {
            // Se já existe o mesmo lote, apenas adiciona à quantidade
            const novaQuantidade = itemExistente.quantidade + this.quantidade;
            const preco = this.loteSelecionado ? this.loteSelecionado.preco : this.evento!.precoMinimo;

            this.eventosService.atualizarItemCarrinho(itemExistente.id, { 
              ...itemExistente, 
              quantidade: novaQuantidade,
              preco: preco,
              setor: setorAtual
            }).subscribe({
              next: () => {
                this.processando = false;
                this.router.navigate(['/carrinho']);
              },
              error: () => this.processando = false
            });
          } else {
            // Se não existe, cria um novo item
            const novoItem = {
              usuarioId: userId,
              eventoId: this.evento!.id,
              titulo: this.evento!.titulo,
              preco: this.loteSelecionado ? this.loteSelecionado.preco : this.evento!.precoMinimo,
              setor: this.loteSelecionado ? this.loteSelecionado.nome : 'Ingresso Geral',
              quantidade: this.quantidade,
              data: this.evento!.data,
              horario: this.evento!.horario,
              local: this.evento!.local,
              imagem: this.evento!.imagens && this.evento!.imagens.length > 0 ? this.evento!.imagens[0] : ''
            };

            this.eventosService.salvarItemCarrinho(novoItem).subscribe({
              next: () => {
                this.processando = false;
                this.router.navigate(['/carrinho']);
              },
              error: () => this.processando = false
            });
          }
        },
        error: () => {
          this.processando = false;
          alert('Erro ao adicionar ao carrinho. Tente novamente.');
        }
      });
    }
  }

  formatarPreco(valor: number): string {
    if (valor === 0) return 'Gratuito';
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }

  abrirModal(img: string): void {
    this.imagemAberta = img;
    this.imagemModalIndex = this.evento?.imagens?.indexOf(img) ?? 0;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  proximaImagemModal(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.evento?.imagens && this.evento.imagens.length > 1) {
      this.imagemModalIndex = (this.imagemModalIndex + 1) % this.evento.imagens.length;
      this.imagemAberta = this.evento.imagens[this.imagemModalIndex];
      this.zoomAtivo = false;
    }
  }

  voltarImagemModal(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.evento?.imagens && this.evento.imagens.length > 1) {
      this.imagemModalIndex = (this.imagemModalIndex - 1 + this.evento.imagens.length) % this.evento.imagens.length;
      this.imagemAberta = this.evento.imagens[this.imagemModalIndex];
      this.zoomAtivo = false;
    }
  }

  fecharModal(): void {
    this.imagemAberta = null;
    this.zoomAtivo = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  toggleZoom(event: MouseEvent): void {
    event.stopPropagation();
    this.zoomAtivo = !this.zoomAtivo;
    if (this.zoomAtivo) {
      this.atualizarPosicaoZoom(event);
    }
  }

  atualizarPosicaoZoom(event: MouseEvent): void {
    if (!this.zoomAtivo) return;
    
    const imgElement = event.currentTarget as HTMLElement;
    const rect = imgElement.getBoundingClientRect();
    
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    this.posicaoZoom = { x, y };
  }
}
