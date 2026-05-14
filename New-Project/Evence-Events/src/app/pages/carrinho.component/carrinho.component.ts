import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../componentes/header/header';
import { FooterComponent } from '../../componentes/footer/footer';
import { EventosService } from '../../services/services';
import { ItemCarrinho } from '../../interfaces/carrinho.interface';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './carrinho.component.html',
  styleUrl: './carrinho.component.css',
})
export class CarrinhoComponent implements OnInit {
  itens: ItemCarrinho[] = [];
  cupomCodigo = '';
  cupomAplicado = false;
  cupomErro = '';
  cupomDesconto = 0;
  cupomCarregando = false;
  itemRemovidoId: number | string | null = null;
  checkoutCarregando = false;
  carregando = true;
  carrinhoVazio = true;
  totalItens = 0;

  readonly taxaServico = 0.1; // 10%
  readonly cuponsValidos: Record<string, number> = {
    'EVENCE10': 0.10,
    'SHOW20': 0.20,
    'FESTA15': 0.15,
    'CHUPA ILAB': 1.00
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarCarrinho();
    }
  }

  carregarCarrinho(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const storedUser = localStorage.getItem('usuarioLogado');
    if (storedUser) {
      const usuario = JSON.parse(storedUser);
      this.eventosService.getCarrinho(usuario.id).subscribe({
        next: (res) => {
          this.itens = res.map((item: any) => ({
            id: item.id, // ID do banco de dados (carrinho)
            eventoId: item.eventoId,
            evento: item.titulo,
            local: item.local,
            data: item.data,
            horario: item.horario,
            setor: item.setor || 'Ingresso Geral',
            quantidade: item.quantidade,
            precoUnitario: item.preco,
            imagem: item.imagem || '',
          }));
          this.atualizarCalculos();
          this.carregando = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao carregar carrinho:', err);
          this.carregando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  private atualizarCalculos(): void {
    this.totalItens = this.itens.reduce((acc, item) => acc + item.quantidade, 0);
    this.carrinhoVazio = this.itens.length === 0;
  }

  get subtotal(): number {
    return this.itens.reduce(
      (acc, item) => acc + item.precoUnitario * item.quantidade,
      0
    );
  }

  get valorDesconto(): number {
    return this.subtotal * this.cupomDesconto;
  }

  get valorTaxa(): number {
    return this.subtotal * this.taxaServico;
  }

  get total(): number {
    return this.subtotal - this.valorDesconto + this.valorTaxa;
  }

  aumentarQuantidade(item: ItemCarrinho): void {
    if (item.quantidade < 10) {
      const novaQtde = item.quantidade + 1;
      this.eventosService.atualizarItemCarrinho(item.id, {
        ...this.buscarItemOriginal(item),
        quantidade: novaQtde
      }).subscribe({
        next: () => {
          item.quantidade = novaQtde;
          this.atualizarCalculos();
          this.cdr.detectChanges();
        }
      });
    }
  }

  diminuirQuantidade(item: ItemCarrinho): void {
    if (item.quantidade > 1) {
      const novaQtde = item.quantidade - 1;
      this.eventosService.atualizarItemCarrinho(item.id, {
        ...this.buscarItemOriginal(item),
        quantidade: novaQtde
      }).subscribe({
        next: () => {
          item.quantidade = novaQtde;
          this.atualizarCalculos();
          this.cdr.detectChanges();
        }
      });
    } else {
      this.removerItem(item.id);
    }
  }

  // Método auxiliar para remontar o item para o banco
  private buscarItemOriginal(item: ItemCarrinho): any {
    const storedUser = localStorage.getItem('usuarioLogado');
    const usuario = storedUser ? JSON.parse(storedUser) : { id: 0 };
    return {
      id: item.id,
      usuarioId: usuario.id,
      eventoId: (item as any).eventoId || item.id, // Fallback caso eventoId não esteja presente
      titulo: item.evento,
      local: item.local,
      data: item.data,
      horario: item.horario,
      preco: item.precoUnitario,
      quantidade: item.quantidade,
      imagem: item.imagem,
      setor: item.setor
    };
  }

  removerItem(id: number | string): void {
    this.itemRemovidoId = id;
    this.eventosService.removerItemCarrinho(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.itens = this.itens.filter((i) => i.id !== id);
          this.atualizarCalculos();
          this.itemRemovidoId = null;
          this.cdr.detectChanges();
        }, 320);
      },
      error: () => {
        this.itemRemovidoId = null;
        this.cdr.detectChanges();
      }
    });
  }

  async aplicarCupom(): Promise<void> {
    if (!this.cupomCodigo.trim()) return;
    this.cupomCarregando = true;
    this.cupomErro = '';

    await new Promise((r) => setTimeout(r, 900));

    const codigo = this.cupomCodigo.trim().toUpperCase();
    if (this.cuponsValidos[codigo]) {
      this.cupomDesconto = this.cuponsValidos[codigo];
      this.cupomAplicado = true;
      this.cupomErro = '';
    } else {
      this.cupomErro = 'Cupom inválido ou expirado.';
      this.cupomAplicado = false;
      this.cupomDesconto = 0;
    }
    this.cupomCarregando = false;
  }

  removerCupom(): void {
    this.cupomCodigo = '';
    this.cupomAplicado = false;
    this.cupomDesconto = 0;
    this.cupomErro = '';
  }

  async finalizarCompra(): Promise<void> {
    this.checkoutCarregando = true;
    await new Promise((r) => setTimeout(r, 800));
    this.checkoutCarregando = false;
    // Persiste desconto de cupom para a página de pagamento
    if (isPlatformBrowser(this.platformId) && this.cupomDesconto > 0) {
      sessionStorage.setItem('cupom_desconto', String(this.cupomDesconto));
    }
    this.router.navigate(['/pagamento']);
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
