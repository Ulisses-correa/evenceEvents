import { Injectable, signal } from '@angular/core';
import { ItemCarrinho, Carrinho, Evento } from '../models/agenda.model';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private carrinho = signal<ItemCarrinho[]>([]);
  private total = signal<number>(0);

  constructor() {
    // Carregar carrinho do localStorage se existir
    this.carregarCarrinho();
  }

  // Adicionar item ao carrinho
  adicionarItem(evento: Evento, tipoAluguel: '30min' | '1hora', quantidade: number = 1): void {
    const precoUnitario = tipoAluguel === '30min' ? (evento.preco30min || 0) : (evento.preco1hora || 0);
    const subtotal = precoUnitario * quantidade;

    const itemExistente = this.carrinho().find(
      item => item.evento.id === evento.id && item.tipoAluguel === tipoAluguel
    );

    if (itemExistente) {
      // Atualizar quantidade do item existente
      const novosItens = this.carrinho().map(item => {
        if (item.evento.id === evento.id && item.tipoAluguel === tipoAluguel) {
          const novaQuantidade = item.quantidade + quantidade;
          return {
            ...item,
            quantidade: novaQuantidade,
            subtotal: precoUnitario * novaQuantidade
          };
        }
        return item;
      });
      this.carrinho.set(novosItens);
    } else {
      // Adicionar novo item
      const novoItem: ItemCarrinho = {
        evento,
        quantidade,
        tipoAluguel,
        precoUnitario,
        subtotal
      };
      this.carrinho.set([...this.carrinho(), novoItem]);
    }

    this.calcularTotal();
    this.salvarCarrinho();
  }

  // Adicionar item com disponibilidade específica
  adicionarItemComDisponibilidade(
    evento: Evento,
    tipoAluguel: '30min' | '1hora',
    quantidade: number = 1,
    dataSelecionada: string,
    horarioSelecionado: string,
    disponibilidadeId: string
  ): void {
    const precoUnitario = tipoAluguel === '30min' ? (evento.preco30min || 0) : (evento.preco1hora || 0);
    const subtotal = precoUnitario * quantidade;

    // Verificar se já existe um item com a mesma disponibilidade
    const itemExistente = this.carrinho().find(
      item => item.disponibilidadeId === disponibilidadeId && item.tipoAluguel === tipoAluguel
    );

    if (itemExistente) {
      // Atualizar quantidade do item existente
      const novosItens = this.carrinho().map(item => {
        if (item.disponibilidadeId === disponibilidadeId && item.tipoAluguel === tipoAluguel) {
          const novaQuantidade = item.quantidade + quantidade;
          return {
            ...item,
            quantidade: novaQuantidade,
            subtotal: precoUnitario * novaQuantidade
          };
        }
        return item;
      });
      this.carrinho.set(novosItens);
    } else {
      // Adicionar novo item com informações de disponibilidade
      const novoItem: ItemCarrinho = {
        evento,
        quantidade,
        tipoAluguel,
        precoUnitario,
        subtotal,
        dataSelecionada,
        horarioSelecionado,
        disponibilidadeId
      };
      this.carrinho.set([...this.carrinho(), novoItem]);
    }

    this.calcularTotal();
    this.salvarCarrinho();
  }

  // Remover item do carrinho
  removerItem(eventoId: string, tipoAluguel: '30min' | '1hora'): void {
    const novosItens = this.carrinho().filter(
      item => !(item.evento.id === eventoId && item.tipoAluguel === tipoAluguel)
    );
    this.carrinho.set(novosItens);
    this.calcularTotal();
    this.salvarCarrinho();
  }

  // Atualizar quantidade de um item
  atualizarQuantidade(eventoId: string, tipoAluguel: '30min' | '1hora', quantidade: number): void {
    if (quantidade <= 0) {
      this.removerItem(eventoId, tipoAluguel);
      return;
    }

    const novosItens = this.carrinho().map(item => {
      if (item.evento.id === eventoId && item.tipoAluguel === tipoAluguel) {
        const precoUnitario = tipoAluguel === '30min' ? (item.evento.preco30min || 0) : (item.evento.preco1hora || 0);
        return {
          ...item,
          quantidade,
          subtotal: precoUnitario * quantidade
        };
      }
      return item;
    });

    this.carrinho.set(novosItens);
    this.calcularTotal();
    this.salvarCarrinho();
  }

  // Limpar carrinho
  limparCarrinho(): void {
    this.carrinho.set([]);
    this.total.set(0);
    this.salvarCarrinho();
  }

  // Obter carrinho atual
  getCarrinho(): ItemCarrinho[] {
    return this.carrinho();
  }

  // Obter total do carrinho
  getTotal(): number {
    return this.total();
  }

  // Obter quantidade total de itens
  getQuantidadeTotal(): number {
    return this.carrinho().reduce((total, item) => total + item.quantidade, 0);
  }

  // Calcular total
  private calcularTotal(): void {
    const novoTotal = this.carrinho().reduce((total, item) => total + item.subtotal, 0);
    this.total.set(novoTotal);
  }

  // Salvar carrinho no localStorage
  private salvarCarrinho(): void {
    try {
      localStorage.setItem('carrinho', JSON.stringify(this.carrinho()));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }

  // Carregar carrinho do localStorage
  private carregarCarrinho(): void {
    try {
      const carrinhoSalvo = localStorage.getItem('carrinho');
      if (carrinhoSalvo) {
        const itens = JSON.parse(carrinhoSalvo);
        this.carrinho.set(itens);
        this.calcularTotal();
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      this.carrinho.set([]);
      this.total.set(0);
    }
  }

  // Signals para reatividade
  carrinhoSignal = this.carrinho.asReadonly();
  totalSignal = this.total.asReadonly();
}
