import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface ItemCarrinho {
  id: number;
  evento: string;
  local: string;
  data: string;
  horario: string;
  setor: string;
  quantidade: number;
  precoUnitario: number;
  imagem: string;
  esgotado?: boolean;
}

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
  itemRemovidoId: number | null = null;
  checkoutCarregando = false;

  readonly taxaServico = 0.1; // 10%
  readonly cuponsValidos: Record<string, number> = {
    'EVENCE10': 0.10,
    'SHOW20': 0.20,
    'FESTA15': 0.15,
  };

  ngOnInit(): void {
    this.itens = [
      {
        id: 1,
        evento: 'Festival de Verão 2026',
        local: 'Arena São Paulo, SP',
        data: '15 Jan 2026',
        horario: '19:00',
        setor: 'Pista Premium',
        quantidade: 2,
        precoUnitario: 180.00,
        imagem: '',
      },
      {
        id: 2,
        evento: 'Show do Ano — Edição Especial',
        local: 'Jeunesse Arena, RJ',
        data: '22 Jan 2026',
        horario: '21:00',
        setor: 'Cadeira Numerada',
        quantidade: 1,
        precoUnitario: 250.00,
        imagem: '',
      },
      {
        id: 3,
        evento: 'Stand Up — Noite de Gala',
        local: 'Teatro Municipal, BH',
        data: '30 Jan 2026',
        horario: '20:30',
        setor: 'Plateia A',
        quantidade: 3,
        precoUnitario: 95.00,
        imagem: '',
      },
    ];
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

  get totalItens(): number {
    return this.itens.reduce((acc, item) => acc + item.quantidade, 0);
  }

  get carrinhoVazio(): boolean {
    return this.itens.length === 0;
  }

  aumentarQuantidade(item: ItemCarrinho): void {
    if (item.quantidade < 10) item.quantidade++;
  }

  diminuirQuantidade(item: ItemCarrinho): void {
    if (item.quantidade > 1) {
      item.quantidade--;
    } else {
      this.removerItem(item.id);
    }
  }

  removerItem(id: number): void {
    this.itemRemovidoId = id;
    setTimeout(() => {
      this.itens = this.itens.filter((i) => i.id !== id);
      this.itemRemovidoId = null;
    }, 320);
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
    await new Promise((r) => setTimeout(r, 1500));
    this.checkoutCarregando = false;
    alert('Redirecionando para o pagamento...');
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
