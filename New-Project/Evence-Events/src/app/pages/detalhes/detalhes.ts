import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { EventosService } from '../../services/services';
import { Evento } from '../../interfaces/evento.interface';
import { Usuario } from '../../interfaces/usuario.interface';

import { HeaderComponent } from '../../componentes/header/header';

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  templateUrl: './detalhes.html',
  styleUrl: './detalhes.css'
})
export class DetalhesComponent implements OnInit {
  evento: Evento | null = null;
  produtor: Usuario | null = null;
  carregando = true;
  erro = false;

  quantidade = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const isPreview = this.route.snapshot.queryParamMap.get('preview') === 'true';
      
      if (id) {
        this.carregarEvento(id, isPreview);
      } else {
        this.erro = true;
        this.carregando = false;
      }
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
        
        if (this.evento?.produtorId) {
          this.eventosService.getUsuarioById(this.evento.produtorId).subscribe({
            next: (produtor) => {
              this.produtor = produtor;
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
      // Se não estiver logado, redireciona para login
      this.router.navigate(['/login']);
      return;
    }

    const usuario: Usuario = JSON.parse(storedUser);
    const userId = usuario.id || 0;

    // Chave do carrinho por usuário
    const cartKey = `carrinho_usuario_${userId}`;
    const cartStored = localStorage.getItem(cartKey);
    let cart: any[] = cartStored ? JSON.parse(cartStored) : [];

    if (this.evento) {
      const index = cart.findIndex(item => item.eventoId === this.evento?.id);
      if (index > -1) {
        cart[index].quantidade += this.quantidade;
      } else {
        cart.push({
          eventoId: this.evento.id,
          titulo: this.evento.titulo,
          preco: this.evento.precoMinimo,
          quantidade: this.quantidade,
          data: this.evento.data,
          horario: this.evento.horario,
          local: this.evento.local
        });
      }

      localStorage.setItem(cartKey, JSON.stringify(cart));
      this.router.navigate(['/carrinho']);
    }
  }

  formatarPreco(valor: number): string {
    if (valor === 0) return 'Gratuito';
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }
}
